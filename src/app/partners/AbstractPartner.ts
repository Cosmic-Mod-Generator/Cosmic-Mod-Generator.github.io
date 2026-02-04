import { CollectionRegistry, INode, Reference as RawReference, StringNode as RawStringNode, SchemaRegistry } from "@mcschema/core"

export abstract class AbstractPartner {
	schemas: SchemaRegistry;
	collections: CollectionRegistry;
	
	/**
	 * A wrapper around {@link RawStringNode StringNode} that automatically uses this partners `collections`
	 */
	StringNode;

	constructor(schemas: SchemaRegistry, collections: CollectionRegistry) {
		this.schemas = schemas
		this.collections = collections
		this.StringNode = RawStringNode.bind(undefined, collections)
	}

	init(): void {
		this.initSchemas(this.schemas);
		this.initCollections(this.collections);
	}

	/**
	 * Called to initialize schemas, aka generators for this partner.
	 * @param schemas The schema registry to use for registering
	 * @see {@link AbstractPartner.initCollections}
	 */
	abstract initSchemas(schemas: SchemaRegistry): void;

	/**
	 * Called to initialize collections, aka lists of presets for each generator.
	 * @param collections The collection registry to use for registering
	 * @see {@link AbstractPartner.initSchemas}
	 */
	abstract initCollections(collections: CollectionRegistry): void;

	/**
	 * Should return the namespace of this partners generators
	 */
	abstract getId(): string;

	/**
	 * Should return the full URL to fetch a .json file from for a preset.
	 * 
	 * For example, you may return something like ``https://raw.githubusercontent.com/User/Repo/main/resources/data/my_registry/${id}.json``
	 * @param preset the preset id to fetch, a value from the `string[]` you would have registered in initCollections
	 */
	abstract mapPresetURL(preset: string): string;

	/**
	 * A wrapper around {@link RawReference Reference} that automatically uses this partners schema and id.
	 * 
	 * @param id The node id you want to reference
	 * @param namespace Optional, defaults to this partners {@link AbstractPartner.getId()}. Specify this if you want to use a reference from another namespace
	 * @returns The node
	 */
	Reference(id: string, namespace: string = this.getId()): INode {
		return RawReference.bind(undefined, this.schemas).call(undefined, `${namespace}:${id}`)
	}

}
