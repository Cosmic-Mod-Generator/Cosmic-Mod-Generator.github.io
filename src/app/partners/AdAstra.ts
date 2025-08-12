import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, ListNode, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode } from '@mcschema/core'

const ID = 'ad_astra'

export function initAdAstra(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

	collections.register('planets', ['earth', 'earth_orbit', 'glacio', 'glacio_orbit', 'mars', 'mars_orbit', 'mercury', 'mercury_orbit', 'moon', 'moon_orbit', 'venus', 'venus_orbit'])


	// Not exported so we recreate it here
	type NumberNodeConfig = {
		/** Whether only integers are allowed */
		integer?: boolean;
		/** If specified, number will be capped at this minimum */
		min?: number;
		/** If specified, number will be capped at this maximum */
		max?: number;
		/** Whether the number represents a color */
		color?: boolean;
	};
	
	schemas.register(`${ID}:planets`, 
		ObjectNode(
			{
				dimension: StringNode(),
				gravity: NumberNode(),
				orbit: Opt(StringNode()),
				oxygen: BooleanNode(),
				solar_power: NumberNode({integer: true, min: 1}),
				solar_system: StringNode(),
				temperature: NumberNode({integer: true}),
				tier: NumberNode({integer: true, min: 1}),
				additional_launch_dimensions: Opt(ListNode(StringNode()))
			}
		)	
	)
}
