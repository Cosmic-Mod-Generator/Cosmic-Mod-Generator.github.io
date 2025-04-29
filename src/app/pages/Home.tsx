import { useMemo } from 'preact/hooks'
import { Footer, GeneratorCard, ToolCard, ToolGroup } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { Store } from '../Store.js'

const MIN_FAVORITES = 2
const MAX_FAVORITES = 5

interface Props {
	path?: string,
}
export function Home({}: Props) {
	const { locale } = useLocale()
	useTitle(locale('title.home'))

	const smallScreen = useMediaQuery('(max-width: 580px)')

	return <main>
		<div class="legacy-container">
			<div class="card-group">
				{smallScreen ? /* mobile */ <>
					<PopularGenerators />
					<FavoriteGenerators />
					<Origin />
					<Tips />
				</> : /* desktop */ <>
					<div class="card-column">
						<PopularGenerators />
						<Origin />
					</div>
					{!smallScreen && <div class="card-column">
						<FavoriteGenerators />
						<Tips />
					</div>}
				</>}
			</div>
			<Footer />
		</div>
	</main>
}

function PopularGenerators() {
	const { locale } = useLocale()
	return <ToolGroup title={locale('generators.popular')} link="/generators/">
		<GeneratorCard minimal id="cosmic_data" />
		<GeneratorCard minimal id="recipe" />
		<ToolCard title={locale('worldgen')} link="/worldgen/" titleIcon="worldgen" />
		<ToolCard title={locale('generators.all')} link="/generators/" titleIcon="arrow_right" />
	</ToolGroup>
}

function FavoriteGenerators() {
	const { locale } = useLocale()

	const favorites = useMemo(() => {
		const history: string[] = []
		for (const id of Store.getGeneratorHistory().reverse()) {
			if (!history.includes(id)) {
				history.push(id)
			}
		}
		return history.slice(0, MAX_FAVORITES)
	}, [])

	if (favorites.length < MIN_FAVORITES) return <></>

	return <ToolGroup title={locale('generators.recent')}>
		{favorites.map(f => <GeneratorCard minimal id={f} />)}
	</ToolGroup>
}

function Origin() {
	return <ToolGroup title={"Origin"} link="https://github.com/misode/misode.github.io" titleIcon="git_commit">
		{<>
			<p class='pp'>This website has been forked from Misode's datapack generator.</p>
			<p class='pp'>In an attempt to not simply steal their entire website, we have made some large changes.</p>
			<p class='pp'>(Along with the changes they recommend in the readme)</p>
			<p class='pp'>Most notably, we have removed all Minecraft versions except 1.20(.1), since thats the only version Cosmic Horizons supports.</p>
			<p class='pp'>We have also removed the other modded generators. We highly recommend you checkout misode.github.io for these features, 
			and if neccesary datapacks can be imported as projects between these sites</p>
		</>}
	</ToolGroup>
}

function Tips() {

	return <ToolGroup title={"Tips"}>
		{<>
			<p class='pp'>If you use a cosmic_data preset, and save the file under the same name (as the preset), it will override the default Cosmic Horizon files!</p>
			<p class='pp'><code>attached_dimension_id</code> can be any dimension, even modded or from your own datapack! Just make sure the namespace is correct!</p>
			<p class='pp'>Any textures you use (in cosmic_data) must be in a <b>resource pack</b> at ../assets/cosmos/textures/[texture_id].png</p>
			<p class='pp'>You can find additional information on cosmic_data on <a href="https://cosmic-mod.github.io/addonsupport/" target="_blank" rel="noreferrer">the wiki!</a></p>

		</>}
	</ToolGroup>
}
