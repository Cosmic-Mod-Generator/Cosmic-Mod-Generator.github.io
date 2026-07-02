import { BooleanNode, CollectionRegistry, MapNode, Mod, NumberNode, ObjectNode, Opt, SchemaRegistry } from "@mcschema/core"
import { AbstractPartner } from "./AbstractPartner.js"
import { ConditionalNode } from "./index.js"

export class CosmicHorizons extends AbstractPartner {

	initSchemas(schemas: SchemaRegistry): void {
		// Stupid javascript needing this. for everything
		const ID = this.getId();
		const StringNode = this.StringNode;
		const Reference = this.Reference.bind(this);
		const IntNode = NumberNode.bind(undefined, {integer: true});

		schemas.register(`${ID}:cosmic_data`, ObjectNode({
				// Switch between planet and space dimensions
				attached_dimention_id: Reference(`dimension`),
		
				// Dimensional data
				dimensional_data : Reference(`dim_data`),
		
				// Skybox data:
				skybox_data: Opt(Reference(`skybox_data`)),
				
				// Planet exclusive stuff
				fog_data: ConditionalNode(
					Opt(
						ObjectNode({
							color: Reference(`rgb`),
							level: NumberNode({
								integer: false,
								min: 0,
								max: 1
							})
						})
					),
				['dimensional_data', 'dimension_type'], 'planet'),
				sky_data: ConditionalNode(MapNode(StringNode(), Reference(`sky_data`)), ['dimensional_data', 'dimension_type'], 'planet'),
		
				// Space exclusive stuff
				planet_data: ConditionalNode(MapNode(StringNode(), Reference(`planet_data`)), ['dimensional_data', 'dimension_type'], 'space'),
				gui_data: ConditionalNode(Opt(MapNode(StringNode(), Reference(`guicategory`))), ['dimensional_data', 'dimension_type'], 'space'),
		
			}, { context: `${ID}.cosmic_data` }))
		
			schemas.register(`${ID}:dim_data`, ObjectNode({
		
				dimension_type: StringNode({ enum: ['planet', 'space'] }),
				
				weather: Opt(BooleanNode()),
		
				weather_data: Mod(Opt(ObjectNode({
					condition: StringNode({ enum: ['rain', 'snow', 'none'] }),
					texture_id: StringNode(),
					speed: NumberNode({max: 5}),
					sound_generic: StringNode(),
					sound_special: StringNode(),
					power: NumberNode({min: 1, max:5}),
					hurt: BooleanNode(),
		
					damage: Mod(Opt(NumberNode({ integer: true })), {
						enabled: path => path.push('hurt').get() === true
					})
		
				})), {
					enabled: path => path.push('weather').get() === false
				}),
		
				clouds: Opt(BooleanNode()),
				sky_objects: Opt(BooleanNode()),
				gravity: Opt(NumberNode()),
				air_resistance: Opt(NumberNode({
					integer: false,
					max: 1,
					min: 0
				})),
		
				atmospheric_data: Opt(Reference(`atmo_data`))
		
			}, { context: `${ID}.dim_data` }))
		
			schemas.register(`${ID}:planet_data`, ObjectNode({
		
				object_name: Opt(StringNode()),
		
				x: IntNode(),
				y: IntNode(),
				z: IntNode(),
		
				yaw: NumberNode(),
				pitch: NumberNode(),
				roll: NumberNode(),
		
				scale: NumberNode({integer:true,min:10}),
					//StringNode(),
		
				glowing: BooleanNode(),
		
				texture_id: ConditionalNode(StringNode(), ['glowing'], false),
		
				core_color: ConditionalNode(Reference(`rgb`), ['glowing'], true),
		
				bloom_color: ConditionalNode(Reference(`rgb`), ['glowing'], true),
		
				collision: BooleanNode(),
		
				travel_to: Opt(ConditionalNode(Reference(`dimension`), ['glowing'], false)),
		
				opaque: Opt(ConditionalNode(BooleanNode(), ['glowing'], false)),
		
				inverse_texture_id: ConditionalNode(Opt(StringNode()), (path) => {
						return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
					}
				),
				atmosphere_color: ConditionalNode(Opt(Reference(`rgba`)), (path) => {
						return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
					}
				),
		
				cloud_data: ConditionalNode(
					Opt(
						ObjectNode({
							animation_folder: StringNode(),
							tick_delay: NumberNode({integer: true, min: 1}),
							frames: NumberNode({integer: true, min: 1}),
		
							cloud_color: Reference(`rgba`),
		
						})
					), (path) => {
						return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
					}
				),
		
				layer: 
					Mod(NumberNode({
						integer: true,
						min: 1,
						max: 256
					}), {
						default: () => {return 64},
						enabled: (path) => {
							return path.push('glowing').get() == true
						}
					}), 
				
		
				ringed: BooleanNode(),
		
				ring_data: ConditionalNode(
					MapNode(StringNode(), ObjectNode({
						texture_id: StringNode(),
						radius: NumberNode(),
						scale_radius: NumberNode(),
						flip_x: BooleanNode(),
						flip_y: BooleanNode(),
						flip_z: BooleanNode(),
		
						additive: Opt(BooleanNode()),
		
						custom_color: ConditionalNode(Reference(`rgba`), ['additive'], true),
		
						multiple: ConditionalNode(NumberNode({integer: true, min: 1}), ['additive'], true),
					})
					), 
				['ringed'], true),
		
				model_type: ConditionalNode(
					Opt(StringNode({enum: ['black_hole']})),
					['glowing'], false
				),
		
				model_data: ConditionalNode(
					ObjectNode({
						color: Reference(`rgb`),
						intensity: NumberNode({integer: true, min: 0}),
						step: NumberNode({integer: true, min: 0}),
						speed: NumberNode({integer: true, min: 0}),
					}), 
					['model_type'], 'black_hole'
				)
		
			}, { context: `${ID}.planet_data` }))
		
			schemas.register(`${ID}:atmo_data`, ObjectNode({
		
				atmosphere_y: IntNode(),
				travel_to: Opt(Reference(`dimension`)),
		
				origin_x: IntNode(),
				origin_y: IntNode(),
				origin_z: IntNode(),
		
				overlay_texture_id: StringNode(),
				shipbit_y: NumberNode({integer: true, min: 0, max: 128}),
				ship_min_y: IntNode()
		
			}, { context: `${ID}.atmo_data` }))
		
			schemas.register(`${ID}:skybox_data`, ObjectNode({
				texture_id: StringNode(),
		
				yaw: NumberNode({integer: true, min: -360, max: 360}),
				pitch: NumberNode({integer: true, min: -360, max: 360}),
				roll: NumberNode({integer: true, min: -360, max: 360}),
		
				alpha: NumberNode({integer: true, min: 0, max: 255}),
		
				rotation_plane: Opt(StringNode({ enum: ['yaw', 'pitch', 'roll'] })),
		
				fade: Opt(StringNode({enum: ['day', 'night']})),
		
				vanilla_sunlight: Opt(BooleanNode()),
		
				sunlight_color: ConditionalNode(
					Reference(`rgba`),
				['vanilla_sunlight'], false)
		
			}, { context: `${ID}.skybox_data` }))
		
			schemas.register(`${ID}:sky_data`, ObjectNode({
				type: StringNode({enum: ['object', 'ring']}),
				
				// ----- Planet sky objects ----- //
		
				phased: ConditionalNode(BooleanNode(), ['type'], 'object'),
		
				// The objects rotation
				object_yaw: ConditionalNode(NumberNode({min: -360, max: 360}), ['type'], 'object'),
				object_pitch: ConditionalNode(NumberNode({min: -360, max: 360}), ['type'], 'object'),
				object_roll: ConditionalNode(NumberNode({min: -360, max: 360}), ['type'], 'object'),
		
				// Its intial rotation around the planet OR the rings rotation
				yaw: NumberNode({min: -360, max: 360}),
				pitch: NumberNode({min: -360, max: 360}),
				roll: NumberNode({min: -360, max: 360}),
		
				yaw_speed: ConditionalNode(NumberNode(), ['type'], 'object'),
				pitch_speed: ConditionalNode(NumberNode(), ['type'], 'object'),
				roll_speed: ConditionalNode(NumberNode(), ['type'], 'object'),
		
				scale: ConditionalNode(NumberNode({integer: false}), ['type'], 'object'),
				
				texture_id: ConditionalNode(Opt(StringNode()), (path) => {
						return (path.push('type').get() == 'object') || (path.push('type').get() == 'ring')
					}
				), 
		
				core_color: ConditionalNode(Reference(`rgb`), (path) => {
						return (path.push('type').get() == 'object') && (path.push('texture_id').get() == undefined)
					}
				),
				bloom_color: ConditionalNode(Reference(`rgb`), (path) => {
						return (path.push('type').get() == 'object') && (path.push('texture_id').get() == undefined)
					}
				),
		
				layer: Mod(Opt(NumberNode({
					integer: true,
					min: 1,
					max: 256
				})), {
					default: () => {return 64},
					enabled: (path) => {
						return (path.push('type').get() == 'object') && (path.push('texture_id').get() == undefined)
					}
				}), 
				
		
				atmosphere_color: ConditionalNode(Opt(Reference(`rgba`)), (path) => {
						return (path.push('type').get() == 'object') && (path.push('texture_id').get() != undefined)
					}
				),
		
				cloud_data: ConditionalNode(
					Opt(
						ObjectNode({
							animation_folder: StringNode(),
							tick_delay: NumberNode({integer: true, min: 1}),
							frames: NumberNode({integer: true, min: 1}),
		
							cloud_color: Reference(`rgba`),
						})
					), (path) => {
						return (path.push('type').get() == 'object') && (path.push('texture_id').get() != undefined)
					}
					
				),
		
				// ----- Ring sky objects ----- //
				additive: ConditionalNode(
					BooleanNode(), 
					['type'], 'ring'
				),
				scale_radius: ConditionalNode(
					NumberNode({integer: false, min: 0.01}), 
					['type'], 'ring'
				),
				
		
			}, { context: `${ID}.sky_data` }))
		
			schemas.register(`${ID}:rgb`, ObjectNode({
					r: Reference(`color`),
					g: Reference(`color`),
					b: Reference(`color`)
			}, {context: `${ID}.rgb`}))
		
			schemas.register(`${ID}:rgba`, ObjectNode({
				r: Reference(`color`),
				g: Reference(`color`),
				b: Reference(`color`),
				alpha: Reference(`color`)
			}, {context: `${ID}.rgb`}))
		
			schemas.register(`${ID}:color`, NumberNode({
				min: 0,
				max: 255
			}))
		
			schemas.register(`${ID}:guicategory`, ObjectNode({
				travel_dimension: Reference(`dimension`), //should be same as attached_dimension_id
		
				origin_x: IntNode(),
				origin_y: IntNode(),
				origin_z: IntNode(),
		
				unlocking_dimension: Reference(`dimension`),
		
				background: StringNode(),
		
				title: StringNode(),
		
				order: IntNode(),
		
				object_data: Opt(MapNode(StringNode(), Reference(`guiplanet`))),
			}))
			
			schemas.register(`${ID}:guiplanet`, ObjectNode({
				texture_id: StringNode(),
		
				scale: NumberNode({min:0, max: 50}),
				ponder_scale: NumberNode({min:1, max: 100}),
		
				yaw: IntNode(),
				pitch: IntNode(),
				roll: IntNode(),
		
				yaw_speed: NumberNode(),
				pitch_speed: NumberNode(),
				roll_speed: NumberNode(),
		
				travel_x: IntNode(),
				travel_y: IntNode(),
				travel_z: IntNode(),
		
				unlocking_dimension: Opt(Reference(`dimension`)),
		
				name: Opt(Reference(`fancy_text`)),
				atmosphere: Opt(Reference(`fancy_text`)),
				type: Opt(Reference(`fancy_text`)),
				conditions: Opt(Reference(`fancy_text`)),
				size: Opt(Reference(`fancy_text`)),
				category: Opt(Reference(`fancy_text`)),
		
				life: NumberNode({integer: true, min: 0, max: 100}),
		
				ringed: BooleanNode(),
		
				ring_data: ConditionalNode(MapNode(StringNode(), ObjectNode({
					texture_id: StringNode(),
					scale_radius: NumberNode({integer: false, min: 0.01})
				})), ['ringed'], true),
				
			})),
		
			schemas.register(`${ID}:fancy_text`, ObjectNode({
				text: StringNode(),
				color: StringNode({enum: ["red", "dark_red", "orange", "yellow", "green", "lime", "cyan", "light_blue", "blue", "magenta", "purple", "pink", "brown", "gray", "light_gray", "black", "white"]})
			}))
	}

	initCollections(collections: CollectionRegistry): void {
		collections.register('cosmic_data', ['alpha_system', 'b_1400_centauri', 'earth_moon', 'europa_lands', 'venuslands', 'gaia_bh_1', 'glacio_lands', 'j_1407blands', 'j_1900', 'jupiterlands', 'marslands', 'mercury_wasteland', 'neptune_lands', 'overworld', 'plutowastelands', 'saturn_lands', 'solar_system', 'uranus_lands'])
		let existing = collections.get("dimension")
		collections.register('dimension', existing.concat(['cosmos:alpha_system', 'cosmos:b_1400_centauri', 'cosmos:earth_moon', 'cosmos:europa_lands', 'cosmos:venuslands', 'cosmos:gaia_bh_1', 'cosmos:glacio_lands', 'cosmos:j_1407blands', 'cosmos:j_1900', 'cosmos:jupiterlands', 'cosmos:marslands', 'cosmos:mercury_wasteland', 'cosmos:neptune_lands', 'cosmos:plutowastelands', 'cosmos:solar_system', 'cosmos:uranus_lands']))
	}

	getId(): string {
		return "cosmos";
	}

	mapPresetURL(_registry: string, preset: string): string {
		return `/data/${preset}.json`
	}

	mapSaveLocation(_namespace: string, id: string): string | void {
		return `data/cosmos/cosmic_data/${id}.json`
	}
}
