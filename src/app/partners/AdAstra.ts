import { BooleanNode, CollectionRegistry, ListNode, NumberNode, ObjectNode, Opt, SchemaRegistry } from "@mcschema/core"
import { AbstractPartner } from "./AbstractPartner.js"

export class AdAstra extends AbstractPartner {
	initSchemas(schemas: SchemaRegistry): void {
		// Stupid javascript needing this. for everything
		const ID = this.getId()
		const StringNode = this.StringNode
		const Reference = this.Reference

		schemas.register(`${ID}:planets`, 
			ObjectNode(
				{
					dimension: Reference('dimension', 'cosmos'),
					gravity: NumberNode(),
					orbit: Opt(StringNode()),
					oxygen: BooleanNode(),
					solar_power: NumberNode({integer: true, min: 1}),
					solar_system: StringNode(),
					temperature: NumberNode({integer: true}),
					tier: NumberNode({integer: true, min: 1}),
					additional_launch_dimensions: Opt(ListNode(StringNode()))
				},
				{
					context: `${ID}.planets`
				}
			)	
		)
	}

	initCollections(collections: CollectionRegistry): void {
		collections.register('planets', ['earth', 'earth_orbit', 'glacio', 'glacio_orbit', 'mars', 'mars_orbit', 'mercury', 'mercury_orbit', 'moon', 'moon_orbit', 'venus', 'venus_orbit'])
	}

	getId(): string {
		return "ad_astra";
	}

	mapPresetURL(preset: string): string {
		throw new Error("Method not implemented.")
	}
}
