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

	/**
	 * Returns `this` for chaining
	 */
	init(): AbstractPartner {
		this.initSchemas(this.schemas);
		this.initCollections(this.collections);
		return this;
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
	 * @param registry the registry (schema) this preset is from. Useful if your partner defines multiple schemas
	 * @param preset the preset id to fetch, a value from the `string[]` you would have registered in initCollections
	 */
	abstract mapPresetURL(registry: string, preset: string): string;

	/**
	 * Should return the full file path (starting at ``data/``) to save this partners json files to.
	 * If void is returned, the normal datapack path generation is used (``data/${namespace}/registry/${id}.json``).
	 * 
	 * Override this if you need a custom path, e.g. ``data/${namespace}/my_mod/${registry}/${id}.json``.
	 * @param namespace The namespace the user is saving the file under
	 * @param id The name of the file the user wants to save (`.json` not included)
	 */
	mapSaveLocation(_namespace: string, _id: string): string | void {

	};

	/**
	 * A wrapper around {@link RawReference Reference} that automatically uses this partners schema and id.
	 * 
	 * @param id The node id you want to reference
	 * @param namespace Optional, defaults to this partners {@link AbstractPartner.getId()}. Specify this if you want to use a reference from another namespace
	 * @returns The node
	 */
	Reference(id: string, namespace: string | undefined = undefined): INode {
		if (namespace == undefined) {
			namespace = this.getId()
		}
		return RawReference.bind(undefined, this.schemas).call(undefined, `${namespace}:${id}`)
	}

}
