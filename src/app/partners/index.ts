import { Mod, StringNode, type CollectionRegistry, type INode, type SchemaRegistry } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { initAdAstra } from './AdAstra.js'
import { initCosmicHorizons } from './CosmicHorizons.js'
import { initValkyrienSkies } from './ValkyrienSkies.js'

export * from './CosmicHorizons.js'

export function initPartners(schemas: SchemaRegistry, collections: CollectionRegistry, _version: VersionId) {
	schemas.register(`cosmos:dimension`, StringNode(collections, {validator: "resource", params: {pool: "$dimension", allowTag: false, allowUnknown: true}}))

	initCosmicHorizons(schemas, collections)
	initValkyrienSkies(schemas, collections)
	initAdAstra(schemas, collections)
}


// Don't ask about the typescript nonesense, all I know is that it works
// Future me: I know how this works now :D
export function ConditionalNode<T extends INode<any>>(node: T, conditionPath: string[], conditionValue: any): T {
	return Mod(node, {
		enabled: path => conditionPath.reduce((p, segment) => p.push(segment), path).get() === conditionValue
		
	}) as T;
}
