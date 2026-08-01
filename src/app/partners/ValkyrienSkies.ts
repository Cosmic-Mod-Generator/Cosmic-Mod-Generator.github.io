import { BooleanNode, ChoiceNode, CollectionRegistry, ListNode, Mod, NumberNode, ObjectNode, Opt, SchemaRegistry } from "@mcschema/core"
import { AbstractPartner } from "./AbstractPartner.js"
import { ConditionalNode } from "./index.js"

export class ValkyrienSkies extends AbstractPartner {
	initSchemas(schemas: SchemaRegistry): void {
		// Stupid javascript needing this. for everything
		const ID = this.getId()
		const StringNode = this.StringNode
		const Reference = this.Reference.bind(this)

		schemas.register(`${ID}:vs_mass`, 
			Mod(
				ChoiceNode(
					[
						{
							type: 'list',
							node: Reference(`list_node`),
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
		
		schemas.register(`${ID}:vs_slugs`,
			ObjectNode({
				replace: Opt(BooleanNode()),
				values: Opt(ListNode(
					ChoiceNode([
						{
							type: 'string',
							node: StringNode(),
							change: (o) => o.id
						},
						{
							type: 'object',
							node: ObjectNode({
								id: StringNode(),
								positions: ListNode(NumberNode({integer: true, min: 0, max: 2}), {minLength: 1})
							}),
							change: (s) => {return {id: s}}
						}
					])
				)),
				remove: Opt(ListNode(StringNode()))
			}, {
				context: `${ID}.vs_slugs`
			})
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
	}

	initCollections(collections: CollectionRegistry): void {
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

		collections.register('vs_dimension_parameters', [
			'overworld', 
			'the_end', 
			'the_nether'
		])

		collections.register('vs_slugs', [
			'nouns'
		])

	}

	getId(): string {
		return "valkyrienskies";
	}

	mapPresetURL(registry: string, preset: string): string {
		if (registry == "vs_mass") {
			return `https://raw.githubusercontent.com/ValkyrienSkies/Valkyrien-Skies-2/refs/heads/1.20.1/main/common/src/main/resources/data/valkyrienskies/vs_mass/${preset}.json`;
		}
		else if (registry == "vs_entities") {
			var url_end;
			if (preset.split(":").length > 1) {
				url_end = `${preset.split(":")[0]}/vs_entities/${preset.split(":")[1]}`;
			} else {
				// no namespace, so we use 'minecraft'
				url_end = `minecraft/vs_entities/${preset}`;
			}
			return `https://raw.githubusercontent.com/ValkyrienSkies/Valkyrien-Skies-2/refs/heads/1.20.1/main/common/src/main/resources/data/${url_end}.json`;
		}
		else if (registry == "vs_dimension_parameters") {
			return `https://raw.githubusercontent.com/ValkyrienSkies/Valkyrien-Skies-2/refs/heads/1.20.1/main/common/src/main/resources/data/valkyrienskies/vs_dimension_parameters/${preset}.json`;
		} else if (registry == "vs_slugs") {
			return `https://raw.githubusercontent.com/ValkyrienSkies/Valkyrien-Skies-2/refs/heads/1.20.1/playtest/common/src/main/resources/data/valkyrienskies/vs_slugs/${preset}.json`
		}
		throw new Error("IllegalStateException: registry not a VS registry");
	}
}
