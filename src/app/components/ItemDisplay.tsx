import type { ItemStack } from 'deepslate/core'
import { Identifier } from 'deepslate/core'
import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks'
import { useVersion } from '../contexts/Version.jsx'
import { useAsync } from '../hooks/useAsync.js'
import { fetchItemComponents } from '../services/index.js'
import { ResolvedItem } from '../services/ResolvedItem.js'
import { renderItem } from '../services/Resources.js'
import { getCollections } from '../services/Schemas.js'
import { jsonToNbt } from '../Utils.js'
import { ItemTooltip } from './ItemTooltip.jsx'
import { Octicon } from './Octicon.jsx'

interface Props {
	item: ItemStack,
	slotDecoration?: boolean,
	tooltip?: boolean,
	advancedTooltip?: boolean,
}
export function ItemDisplay({ item, slotDecoration, tooltip, advancedTooltip }: Props) {
	const { version } = useVersion()
	const el = useRef<HTMLDivElement>(null)
	const [tooltipOffset, setTooltipOffset] = useState<[number, number]>([0, 0])
	const [tooltipSwap, setTooltipSwap] = useState(false)

	useEffect(() => {
		const onMove = (e: MouseEvent) => {
			requestAnimationFrame(() => {
				const { right, width } = el.current!.getBoundingClientRect()
				const swap = right + 200 > document.body.clientWidth
				setTooltipSwap(swap)
				setTooltipOffset([(swap ? width - e.offsetX : e.offsetX) + 20, e.offsetY - 40])
			})
		}
		el.current?.addEventListener('mousemove', onMove)
		return () => el.current?.removeEventListener('mousemove', onMove)
	}, [])

	const { value: baseComponents } = useAsync(() => fetchItemComponents(version), [version])
	const itemResolver = useCallback((item: ItemStack) => {
		const base = baseComponents?.get(item.id.toString()) ?? new Map()
		return new ResolvedItem(item, new Map([...base.entries()].map(([k, v]) => [k, jsonToNbt(v)])))
	}, [baseComponents])
	const resolvedItem = useMemo(() => {
		return itemResolver(item)
	}, [item, baseComponents])

	const maxDamage = resolvedItem.getMaxDamage()
	const damage = resolvedItem.getDamage()

	return <div class="item-display" ref={el}>
		<ItemItself item={resolvedItem} />
		{item.count !== 1 && <>
			<svg class="item-count" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMinYMid meet">
				<text x="95" y="93" font-size="50" textAnchor="end" fontFamily="MinecraftSeven" fill="#373737">{item.count}</text>
				<text x="90" y="88" font-size="50" textAnchor="end" fontFamily="MinecraftSeven" fill="#ffffff">{item.count}</text>
			</svg>
		</>}
		{slotDecoration && <>
			{(maxDamage > 0 && damage > 0) && <svg class="item-durability" width="100%" height="100%" viewBox="0 0 18 18">
				<rect x="3" y="14" width="13" height="2" fill="#000" />
				<rect x="3" y="14" width={`${(maxDamage - damage) / maxDamage * 13}`} height="1" fill={`hsl(${(maxDamage - damage) / maxDamage * 120}deg, 100%, 50%)`} />
			</svg>}
			<div class="item-slot-overlay"></div>
		</>}
		{tooltip !== false && <div class="item-tooltip" style={tooltipOffset && {
			left: (tooltipSwap ? undefined : `${tooltipOffset[0]}px`),
			right: (tooltipSwap ? `${tooltipOffset[0]}px` : undefined),
			top: `${tooltipOffset[1]}px`,
		}}>
			<ItemTooltip item={resolvedItem} advanced={advancedTooltip} resolver={itemResolver} />
		</div>}
	</div>
}

interface ResolvedProps extends Props {
	item: ResolvedItem
}
function ItemItself({ item }: ResolvedProps) {
	const { version } = useVersion()

	if (item.id.namespace !== Identifier.DEFAULT_NAMESPACE) {
		return Octicon.package
	}

	const { value: collections } = useAsync(() => getCollections(version), [])

	if (collections === undefined) {
		return null
	}

	const modelPath = `item/${item.id.path}`
	if (collections.get('model').includes('minecraft:' + modelPath)) {
		return <RenderedItem item={item} />
	}

	return Octicon.package
}

function RenderedItem({ item }: ResolvedProps) {
	const { version } = useVersion()
	const { value: src } = useAsync(() => renderItem(version, item.flatten()), [version, item])

	if (src) {
		return <>
			<img src={src} alt={item.id.toString()} class="model" draggable={false} />
			{item.hasFoil() && <div class="item-glint" style={{'--mask-image': `url("${src}")`}}></div>}
		</>
	}

	return <div class="item-display">
		{Octicon.package}
	</div>
}
