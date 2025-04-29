import type { CollectionRegistry, INode, SchemaRegistry } from '@mcschema/core'
import { BooleanNode, MapNode, Mod, NumberNode, ObjectNode, Opt, Reference as RawReference, StringNode as RawStringNode } from '@mcschema/core'

const ID = 'cosmos'

export function initCosmicHorizons(schemas: SchemaRegistry, collections: CollectionRegistry) {
	const Reference = RawReference.bind(undefined, schemas)
	const StringNode = RawStringNode.bind(undefined, collections)

	// Register presets, will search for them at /data/{id}.json
	collections.register('cosmic_data', ['alpha_system', 'b_1400_centauri', 'earth_moon', 'europa_lands', 'venuslands', 'gaia_bh_1', 'glacio_lands', 'j_1407blands', 'j_1900', 'jupiterlands', 'marslands', 'mercury_wasteland', 'neptune_lands', 'overworld', 'plutowastelands', 'saturn_lands', 'solar_system', 'uranus_lands'])
	
	// Don't ask about the typescript nonesense, all I know is that it works
	function conditionalNode<T extends INode<any>>(node: T, conditionPath: string[], conditionValue: any): T {
		return Mod(node, {
			enabled: path => conditionPath.reduce((p, segment) => p.push(segment), path).get() === conditionValue
			
		}) as T;
	}

	schemas.register(`${ID}:cosmic_data`, ObjectNode({
		// Switch between planet and space dimensions
		attached_dimention_id: Reference(`${ID}:dimension`),

		// Dimensional data
		dimensional_data : Reference(`${ID}:dim_data`),

		// Skybox data:
		skybox_data: Opt(Reference(`${ID}:skybox_data`)),
		
		// Planet exclusive stuff
		fog_data: conditionalNode(
			Opt(
				ObjectNode({
					color: Reference(`${ID}:rgb`),
					level: NumberNode({
						integer: false,
						min: 0,
						max: 1
					})
				})
			),
		['dimensional_data', 'dimension_type'], 'planet'),
		sky_data: conditionalNode(MapNode(StringNode(), Reference(`${ID}:sky_data`)), ['dimensional_data', 'dimension_type'], 'planet'),

		// Space exclusive stuff
		planet_data: conditionalNode(MapNode(StringNode(), Reference(`${ID}:planet_data`)), ['dimensional_data', 'dimension_type'], 'space'),
		gui_data: conditionalNode(Opt(MapNode(StringNode(), Reference(`${ID}:guicategory`))), ['dimensional_data', 'dimension_type'], 'space'),

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

		atmospheric_data: Opt(Reference(`${ID}:atmo_data`))

	}, { context: `${ID}.dim_data` }))

	schemas.register(`${ID}:planet_data`, ObjectNode({

		x: NumberNode({integer:true}),
		y: NumberNode({integer:true}),
		z: NumberNode({integer:true}),

		yaw: NumberNode(),
		pitch: NumberNode(),
		roll: NumberNode(),

		scale: NumberNode({integer:true,min:10}),
			//StringNode(),

		glowing: BooleanNode(),

		texture_id: conditionalNode(StringNode(), ['glowing'], false),

		core_color: conditionalNode(Reference(`${ID}:rgb`), ['glowing'], true),

		bloom_color: conditionalNode(Reference(`${ID}:rgb`), ['glowing'], true),

		travel_to: Opt(conditionalNode(Reference(`${ID}:dimension`), ['glowing'], false)),

		opaque: Opt(conditionalNode(BooleanNode(), ['glowing'], false)),

		inverse_texture_id: Mod(Opt(StringNode()), {
			enabled: (path) => {
				return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
			}
		}),
		atmosphere_color: Mod(Opt(Reference(`${ID}:rgba`)), {
			enabled: (path) => {
				return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
			}
		}),

		cloud_data: Mod(
			Opt(
				ObjectNode({
					animation_folder: StringNode(),
					tick_delay: NumberNode({integer: true, min: 1}),
					frames: NumberNode({integer: true, min: 1}),

					cloud_color: Reference(`${ID}:rgba`),

				})
			), {
			enabled: (path) => {
				return (path.push('glowing').get() == false) && (path.push('opaque').get() == true)
			}
		}),

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

		ring_data: conditionalNode(
			MapNode(StringNode(), ObjectNode({
				texture_id: StringNode(),
				radius: NumberNode(),
				scale_radius: NumberNode(),
				flip_x: BooleanNode(),
				flip_y: BooleanNode(),
				flip_z: BooleanNode(),

				additive: Opt(BooleanNode()),

				custom_color: conditionalNode(Reference(`${ID}:rgba`), ['additive'], true),

				multiple: conditionalNode(NumberNode({integer: true, min: 1}), ['additive'], true),
			})
			), 
		['ringed'], true),

		model_type: conditionalNode(
			Opt(StringNode({enum: ['black_hole']})),
			['glowing'], false
		),

		model_data: conditionalNode(
			ObjectNode({
				color: Reference(`${ID}:rgb`),
				intensity: NumberNode({integer: true, min: 0}),
        		step: NumberNode({integer: true, min: 0}),
        		speed: NumberNode({integer: true, min: 0}),
			}), 
			['model_type'], 'black_hole'
		)

	}, { context: `${ID}.planet_data` }))

	schemas.register(`${ID}:atmo_data`, ObjectNode({

		atmosphere_y: NumberNode({integer: true}),
		travel_to: Opt(Reference(`${ID}:dimension`)),

		origin_x: NumberNode({integer: true}),
		origin_y: NumberNode({integer: true}),
		origin_z: NumberNode({integer: true}),

		overlay_texture_id: StringNode(),
		shipbit_y: NumberNode({integer: true, min: 0, max: 128}),
		ship_min_y: NumberNode({integer: true})

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

		sunlight_color: conditionalNode(
			Reference(`${ID}:rgba`),
		['vanilla_sunlight'], false)

	}, { context: `${ID}.skybox_data` }))

	schemas.register(`${ID}:sky_data`, ObjectNode({
		type: StringNode({enum: ['object', 'ring']}),
		
		// ----- Planet sky objects ----- //

		phased: conditionalNode(BooleanNode(), ['type'], 'object'),

		// The objects rotation
		object_yaw: conditionalNode(NumberNode({integer: true, min: -360, max: 360}), ['type'], 'object'),
		object_pitch: conditionalNode(NumberNode({integer: true, min: -360, max: 360}), ['type'], 'object'),
		object_roll: conditionalNode(NumberNode({integer: true, min: -360, max: 360}), ['type'], 'object'),

		// Its intial rotation around the planet OR the rings rotation
		yaw: NumberNode({min: -360, max: 360}),
		pitch: NumberNode({min: -360, max: 360}),
		roll: NumberNode({min: -360, max: 360}),

		yaw_speed: conditionalNode(NumberNode(), ['type'], 'object'),
		pitch_speed: conditionalNode(NumberNode(), ['type'], 'object'),
		roll_speed: conditionalNode(NumberNode(), ['type'], 'object'),

		scale: conditionalNode(NumberNode({integer: false}), ['type'], 'object'),
		
		texture_id: conditionalNode(Opt(StringNode()), ['type'], 'object'),

		// More complicated than conditionalNode can do
		core_color: Mod(Reference(`${ID}:rgb`), {
			enabled: (path) => {
				return (path.push('type').get() == 'object') && (path.push('texture_id').get() == undefined)
			}
		}),
		bloom_color: Mod(Reference(`${ID}:rgb`), {
			enabled: (path) => {
				return (path.push('type').get() == 'object') && (path.push('texture_id').get() == undefined)
			}
		}),

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
		

		atmosphere_color: Mod(Opt(Reference(`${ID}:rgba`)), {
			enabled: (path) => {
				return (path.push('type').get() == 'object') && (path.push('texture_id').get() != undefined)
			}
		}),

		cloud_data: Mod(
			Opt(
				ObjectNode({
					animation_folder: StringNode(),
					tick_delay: NumberNode({integer: true, min: 1}),
					frames: NumberNode({integer: true, min: 1}),

					cloud_color: Reference(`${ID}:rgba`),
				})
			), {
				enabled: (path) => {
					return (path.push('type').get() == 'object') && (path.push('texture_id').get() != undefined)
				}
			}
		),

		// ----- Ring sky objects ----- //
		ring_data: conditionalNode(ObjectNode({
			texture_id: StringNode(),
			additive: BooleanNode(),
			scale_radius: NumberNode({integer: false, min: 0.01})
		}), ['type'], 'ring'),

	}, { context: `${ID}.sky_data` }))

	schemas.register(`${ID}:rgb`, ObjectNode({
			r: Reference(`${ID}:color`),
			g: Reference(`${ID}:color`),
			b: Reference(`${ID}:color`)
	}, {context: `${ID}.rgb`}))

	schemas.register(`${ID}:rgba`, ObjectNode({
		r: Reference(`${ID}:color`),
		g: Reference(`${ID}:color`),
		b: Reference(`${ID}:color`),
		alpha: Reference(`${ID}:color`)
	}, {context: `${ID}.rgb`}))

	schemas.register(`${ID}:color`, NumberNode({
		min: 0,
		max: 255
	}))

	schemas.register(`${ID}:guicategory`, ObjectNode({
		travel_dimension: Reference(`${ID}:dimension`), //should be same as attached_dimension_id

		origin_x: NumberNode({integer: true}),
		origin_y: NumberNode({integer: true}),
		origin_z: NumberNode({integer: true}),

		unlocking_dimension: Reference(`${ID}:dimension`),

		background: StringNode(),

		title: StringNode(),

		order: NumberNode({integer: true}),

		object_data: Opt(MapNode(StringNode(), Reference(`${ID}:guiplanet`))),
	}))
	
	schemas.register(`${ID}:guiplanet`, ObjectNode({
		texture_id: StringNode(),

		scale: NumberNode({min:0, max: 50}),
		ponder_scale: NumberNode({min:1, max: 100}),

		yaw: NumberNode({integer:true}),
		pitch: NumberNode({integer:true}),
		roll: NumberNode({integer:true}),

		yaw_speed: NumberNode(),
		pitch_speed: NumberNode(),
		roll_speed: NumberNode(),

		travel_x: NumberNode({integer: true}),
		travel_y: NumberNode({integer: true}),
		travel_z: NumberNode({integer: true}),

		unlocking_dimension: Opt(Reference(`${ID}:dimension`)),

		name: Opt(Reference(`${ID}:fancy_text`)),
		atmosphere: Opt(Reference(`${ID}:fancy_text`)),
		type: Opt(Reference(`${ID}:fancy_text`)),
		conditions: Opt(Reference(`${ID}:fancy_text`)),
		size: Opt(Reference(`${ID}:fancy_text`)),
		category: Opt(Reference(`${ID}:fancy_text`)),

		life: NumberNode({integer: true, min: 0, max: 100}),

		ringed: BooleanNode(),

		ring_data: conditionalNode(MapNode(StringNode(), ObjectNode({
			texture_id: StringNode(),
			scale_radius: NumberNode({integer: false, min: 0.01})
		})), ['ringed'], true),
		
	})),

	schemas.register(`${ID}:fancy_text`, ObjectNode({
		text: StringNode(),
		color: StringNode({enum: ["red", "dark_red", "orange", "yellow", "green", "lime", "cyan", "light_blue", "blue", "magenta", "purple", "pink", "brown", "gray", "light_gray", "black", "white"]})
	}))

	schemas.register(`${ID}:dimension`, StringNode()) //For later
}
