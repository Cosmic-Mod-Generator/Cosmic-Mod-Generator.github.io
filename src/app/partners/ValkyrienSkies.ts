import type { CollectionRegistry, INode, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode } from '@mcschema/core'

const ID = 'valkyrienskies'

export function initValkyrienSkies(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)
	
	collections.register('vs_mass', ['1_18_blocks', 'computercraft', 'crafting_stations', 'ground', 'masonry', 'misc', 'plants', 'redstone_components', 'wood'])

	function conditionalNode<T extends INode<any>>(node: T, conditionPath: string[], conditionValue: any): T {
			return Mod(node, {
				enabled: path => conditionPath.reduce((p, segment) => p.push(segment), path).get() === conditionValue,
			}) as T;
		}

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
				block: conditionalNode(StringNode({
					validator: 'resource',
					params: { pool: 'block' },
				}),
				['tag'], undefined),

				// OR a 'tag':'namespace:a_tag'
				tag: conditionalNode(StringNode({
					validator: 'resource',
					params: {pool: '$tag/block'}
				}), ['block'], undefined),

				// All optional (although should probably have atleast one)
				mass: Opt(NumberNode({min: 0.0})),
				friction: Opt(NumberNode({min: 0.0})),
				elasticity: Opt(NumberNode({min: 0.0})),
				priority: Opt(NumberNode({integer: true}))
			}),
			{
				context: `${ID}.list_node`
			}
		)
	)

	collections.register('vs_entities', [
		'minecraft/armor_stand', 
		'minecraft/chest_minecart', 
		'minecraft/end_crystal', 
		'minecraft/furnace_minecart', 
		'minecraft/glow_item_frame', 
		'minecraft/hopper_minecart', 
		'minecraft/item_frame', 
		'minecraft/leash_knot', 
		'minecraft/minecart', 
		'minecraft/painting', 
		'minecraft/tnt_minecart', 
		'create/carriage_contraption', 
		'create/contraption', 
		'create/gantry_contraption', 
		'create/seat', 
		'create/stationary_contraption', 
		'create/super_glue'
	])


	schemas.register(`${ID}:vs_entities`, ObjectNode({
		handler: StringNode({enum: ["valkyrienskies:default", "valkyrienskies:shipyard"]})
	}))
}
