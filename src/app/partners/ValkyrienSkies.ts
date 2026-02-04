import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode } from '@mcschema/core'
import { ConditionalNode } from './index.js'

const ID = 'valkyrienskies'

export function initValkyrienSkies(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)
	
	collections.register('vs_mass', [
		'building/deco/brick', 
		'building/deco/mud', 
		'building/deco/netherrack', 
		'building/deco/prismarine', 
		'building/deco/purpur', 
		'building/deco/quartz', 
		'building/deco/sandstone', 
		'building/stone/andesite', 
		'building/stone/basalt', 
		'building/stone/blackstone', 
		'building/stone/cobble',
		'building/stone/deepslate',
		'building/stone/diorite',
		'building/stone/endstone',
		'building/stone/granite',
		'building/stone/smooth_stone',
		'building/stone/stone',
		'building/stone/stone_bricks',
		'building/wood/acacia',
		'building/wood/bamboo',
		'building/wood/birch',
		'building/wood/cherry',
		'building/wood/crimson',
		'building/wood/dark_oak',
		'building/wood/default',
		'building/wood/jungle',
		'building/wood/mangrove',
		'building/wood/oak',
		'building/wood/spruce',
		'building/wood/warped',
		'building/copper',
		'building/iron',
		'building/valuables',
		'functional/misc',
		'functional/deco',
		'functional/crafting_stations',
		'unobtainable',
		'natural/misc',
		'natural/tree',
		'natural/plants',
		'natural/dirt',
		'natural/ore',
		'natural/stone_ish',
		'colored/concrete',
		'colored/candle',
		'colored/concrete_powder',
		'colored/glass',
		'colored/glass_pane',
		'colored/glazed_terracotta',
		'colored/tagged',
		'compat/computercraft',
		'compat/copycatsplus',
		'compat/steelarmorblocks',
		'compat/createtweakedcontrollers',
		'compat/copiescats',
		'compat/create',
		'redstone/components',
		'redstone/blocks',
	])

	schemas.register(`${ID}:vs_mass`, 
		Mod(
			ChoiceNode(
				[
					{
						type: 'list',
						node: Reference(`${ID}:list_node`),
						change: v => [v]
					},
					// Hella sus but it works
					{
						type: 'invalid',
						node: BooleanNode(),
						change: () => {
							return true
						}
					}
				], {}
			), {
				default: () => ({
					text: ""
				})
			}
		)
	)

	schemas.register(`${ID}:list_node`, 
		ListNode(
			ObjectNode({
				
				// They can provide a 'block': 'namespace:whatever'
				block: ConditionalNode(StringNode({
					validator: 'resource',
					params: { pool: 'block' },
				}),
				['tag'], undefined),

				// OR a 'tag':'namespace:a_tag'
				tag: ConditionalNode(StringNode({
					validator: 'resource',
					params: {pool: '$tag/block'}
				}), ['block'], undefined),

				// All optional (although should probably have atleast one)
				mass: Opt(NumberNode({min: 0.0})),
				friction: Opt(NumberNode({min: 0.0})),
				elasticity: Opt(NumberNode({min: 0.0})),
				// Does nothing if false
				no_collision: Opt(BooleanNode()),
				priority: Opt(NumberNode({integer: true}))
			}),
			{
				context: `${ID}.list_node`
			}
		)
	)

	collections.register('vs_entities', [
		'complexhex:parametric/line',
		'complexhex:parametric/surface',
		'create:carriage_contraption', 
		'create:contraption', 
		'create:gantry_contraption', 
		'create:seat', 
		'create:stationary_contraption', 
		'create:super_glue',
		'ducky_periph:focal_port_wrapper_entity',
		'hexcasting:wall_scroll',
		'hexical:mesh',
		'hexical:speck',
		'minecraft:armor_stand', 
		'minecraft:chest_minecart', 
		'minecraft:end_crystal', 
		'minecraft:furnace_minecart', 
		'minecraft:glow_item_frame', 
		'minecraft:hopper_minecart', 
		'minecraft:item_frame', 
		'minecraft:leash_knot', 
		'minecraft:minecart', 
		'minecraft:painting', 
		'minecraft:tnt_minecart', 
		'valkyrienskies:ship_mounting_entity'
	])


	schemas.register(`${ID}:vs_entities`, ObjectNode({
		handler: StringNode({enum: ["valkyrienskies:default", "valkyrienskies:shipyard"]})
	}, {context: `${ID}.vs_entities`}))

	schemas.register(`${ID}:vs_dimension_parameters`, 
		ObjectNode({
			dimensionId: StringNode(),
			maxYPos: NumberNode({min: -1, integer: true}),
			seaLevel: NumberNode({integer: true}),
			gravity: ListNode(NumberNode(), {minLength: 3, maxLength: 3}),
			priority: NumberNode({integer: true})
		}, {context: `${ID}.vs_dimension_parameters`})
	)

	collections.register('vs_dimension_parameters', [
		'overworld', 
		'the_end', 
		'the_nether'
	])


}
