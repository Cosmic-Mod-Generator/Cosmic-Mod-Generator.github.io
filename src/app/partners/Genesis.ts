import { BooleanNode, ChoiceNode, CollectionRegistry, INode, ListNode, MapNode, Mod, ModelPath, NumberNode, ObjectNode, Opt, SchemaRegistry, SwitchNode } from "@mcschema/core"
import { AbstractPartner } from "./AbstractPartner.js"

export class Genesis extends AbstractPartner {
	initSchemas(schemas: SchemaRegistry): void {
		// Stupid javascript needing this. for everything
		const ID = this.getId()
		const StringNode = this.StringNode
		const Reference = this.Reference.bind(this)

		schemas.register(`${ID}:celestials`, 
			ObjectNode({
				type: Reference("celestial_types"),
				size: NumberNode({min: 1.0, integer: true}),
				gravity: NumberNode(),
				transformProvider: LookupSwitchNode(
					"type", {
						"genesis:static": ObjectNode({type: Reference("transform_providers"),
							x: NumberNode(),
							y: NumberNode(),
							z: NumberNode(),
							xRot: Opt(NumberNode()),
							yRot: Opt(NumberNode()),
							zRot: Opt(NumberNode())
						}),
						"genesis:orbiting": ObjectNode({type: Reference("transform_providers"),
							parentID: StringNode(),
							seed: NumberNode({min:0, integer: true}),
							orbitDistance: NumberNode(),
							orbitTime: NumberNode(),
							dayLength: Opt(NumberNode({min: 0}))
						})
					},
					Mod(MapNode(StringNode(), Reference(`any_node`)), {default: () => {return {type: "genesis:static"}}}),
					false
				),
				properties: LookupSwitchNode(
					"type", {
						"genesis:star": ObjectNode({
							r0: Reference(`rgb`),
							g0: Reference(`rgb`),
							b0: Reference(`rgb`),
							r1: Reference(`rgb`),
							g1: Reference(`rgb`),
							b1: Reference(`rgb`),
						}),
						"genesis:body": ObjectNode({
							atmosphere: ObjectNode({
								density: NumberNode({min: 0.0}),
								thickness: NumberNode({min: 0.0}),
								precipitation: BooleanNode(),
								isBreathable: BooleanNode(),
								color: LookupSwitchNode(
									"type", {
										"genesis:overworld": ObjectNode({type: Reference("colors")}),
										"genesis:rgb": ObjectNode({type: Reference("colors"),
											r: Reference(`rgb`),
											g: Reference(`rgb`),
											b: Reference(`rgb`)
										})
									},
									Mod(MapNode(StringNode(), Reference(`any_node`)), {default: () => {return {type: "genesis:overworld"}}}),
									false
								)
							})
						}),
						"genesis:blackhole": ObjectNode({})
					},
					MapNode(StringNode(), Reference(`any_node`))
				)
			}, {
				context: `${ID}.celestials`
			})
		)

		schemas.register(`${ID}:transform_providers`, StringNode({
			enum: ["genesis:static", "genesis:orbiting"],
			additional: true
		}))

		schemas.register(`${ID}:celestial_types`, StringNode({
			enum: ["genesis:star", "genesis:body", "genesis:blackhole"],
			additional: true
		}))

		schemas.register(`${ID}:colors`, StringNode({
			enum: ["genesis:overworld", "genesis:rgb"],
			additional: true
		}))
	
		schemas.register(`${ID}:rgb`, 
			NumberNode({min: 0, max: 255, integer: true})
		)

		schemas.register(`${ID}:any_node`,
			Mod(ChoiceNode([
				{
					type: 'object',
					node: MapNode(Reference(`any_node`), Reference(`any_node`)),
					change: v => v instanceof Array ? (typeof v[0] === 'object' ? v[0] : { text: getSimpleString(v[0]) }) : typeof v === 'object' ? v : { text: getSimpleString(v) }
				},
				{
					type: 'list',
					node: ListNode(Reference(`any_node`)),
					change: v => [v]
				},
				{
					type: 'string',
					priority: 1,
					node: StringNode(),
					change: getSimpleString
				},
				{
					type: 'number',
					node: NumberNode(),
					change: v => {
						const n = parseFloat(getSimpleString(v))
						return isFinite(n) ? n : (!!v ? 1 : 0)
					}
				},
				{
					type: 'boolean',
					node: BooleanNode(),
					change: v => {
						const s = getSimpleString(v)
						return s === 'true' || s === 'false' ? s === 'true' : !!s
					}
				}
			], { context: 'any_node' }), {
				default: () => ({
					text: ""
				})
			})
		)
	}

	initCollections(collections: CollectionRegistry): void {
		collections.register('celestials', [
			'genesis:moon', 
			'genesis:sun', 
			'genesis:testbh', 
			'minecraft:overworld'
		])
	}

	getId(): string {
		return "genesis";
	}

	mapPresetURL(registry: string, preset: string): string {
		var url_end;
		if (preset.split(":").length > 1) {
			url_end = `${preset.split(":")[0]}/genesis/celestials/${preset.split(":")[1]}`;
		} else {
			// no namespace, so we use 'minecraft'
			url_end = `minecraft/genesis/celestials/${preset}`;
		}
		return `https://raw.githubusercontent.com/jamesgreen26/genesis/refs/heads/1.20.1/src/main/resources/data/${url_end}.json`
	}
}

type NodeLookupCase<T> = Record<string, INode<T>>;

function LookupSwitchNode<T>(
    siblingKey: string,
    cases: NodeLookupCase<T>,
    defaultNode: INode<T>,
	popRoot: boolean = true
): INode<T> {
    var node = SwitchNode([
        ...Object.entries(cases).map(([value, node]) => ({
            match: (path: ModelPath) => {
				if (popRoot) {
					path = path.pop()
				}
				return path.push(siblingKey).get() === value
			},
            node
        })),
        {
            match: () => true,
            priority: -1,
            node: defaultNode
        }
    ]);
	if (!popRoot) {
		node = Mod(node, {
			validate(path, value, errors, options) {
				if (!value) return defaultNode.default();
				if (!(siblingKey in value) || typeof(value[siblingKey]) != "string") {
					return defaultNode.default()
				}
				return value;
			},
			default: () => {return defaultNode.default()}	
		})
	}
	return node;
}

const getSimpleString = (v: any): string => v instanceof Array ? getSimpleString(v[0]) : v?.text ?? (typeof v === 'object' ? '' : v?.toString())
