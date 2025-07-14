import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, ChoiceNode, ListNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode } from '@mcschema/core'

const ID = 'valkyrienskies'

export function initValkyrienSkies(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)
	
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
				block: StringNode({
					validator: 'resource',
					params: { pool: 'block' },
				}),
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


	schemas.register(`${ID}:vs_entities`, ObjectNode({
		handler: StringNode({enum: ["valkyrienskies:default", "valkyrienskies:shipyard"]})
	}))
}
