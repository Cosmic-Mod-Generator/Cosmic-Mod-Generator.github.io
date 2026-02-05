import { BooleanNode, CollectionRegistry, ListNode, NumberNode, ObjectNode, Opt, SchemaRegistry } from "@mcschema/core"
import { AbstractPartner } from "./AbstractPartner.js"

export class AdAstra extends AbstractPartner {
	initSchemas(schemas: SchemaRegistry): void {
		// Stupid javascript needing this. for everything
		const ID = this.getId()
		const StringNode = this.StringNode
		const Reference = this.Reference.bind(this)

		schemas.register(`${ID}:planets`, 
			ObjectNode(
				{
					dimension: Reference('dimension', 'cosmos'),
					gravity: NumberNode(),
					orbit: Opt(Reference('dimension', 'cosmos')),
					oxygen: BooleanNode(),
					solar_power: NumberNode({integer: true, min: 1}),
					solar_system: StringNode(),
					temperature: NumberNode({integer: true}),
					tier: NumberNode({integer: true, min: 1}),
					additional_launch_dimensions: Opt(ListNode(Reference('dimension', 'cosmos')))
				},
				{
					context: `${ID}.planets`
				}
			)	
		)
	}

	initCollections(collections: CollectionRegistry): void {
		collections.register('planets', ['earth', 'earth_orbit', 'glacio', 'glacio_orbit', 'mars', 'mars_orbit', 'mercury', 'mercury_orbit', 'moon', 'moon_orbit', 'venus', 'venus_orbit'])
		// Works! But is for later
		//collections.register('dimension', ['ad_astra:moon'])
	}

	getId(): string {
		return "ad_astra";
	}

	mapPresetURL(registry: string, preset: string): string {
		return `https://raw.githubusercontent.com/terrarium-earth/Ad-Astra/refs/heads/1.20.1/common/src/main/generated/resources/data/ad_astra/planets/${preset}.json`
	}
}
