import { CollectionRegistry, INode, Reference as RawReference, StringNode as RawStringNode, SchemaRegistry } from "@mcschema/core"

export abstract class AbstractPartner {
	schemas: SchemaRegistry;
	collections: CollectionRegistry;
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

	abstract initSchemas(schemas: SchemaRegistry): void;
	abstract initCollections(collections: CollectionRegistry): void;

	abstract getId(): string;

	abstract mapPresetURL(preset: string): string;

	Reference(id: string, namespace: string = this.getId()): INode {
		return RawReference.bind(undefined, this.schemas).call(undefined, `${namespace}:${id}`)
	}

}
