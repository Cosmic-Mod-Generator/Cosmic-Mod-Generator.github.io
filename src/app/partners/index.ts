import { Mod, ModelPath, StringNode, type CollectionRegistry, type INode, type SchemaRegistry } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { AbstractPartner } from './AbstractPartner.js'
import { AdAstra } from './AdAstra.js'
import { CosmicHorizons } from './CosmicHorizons.js'
import { Genesis } from './Genesis.js'
import { ValkyrienSkies } from './ValkyrienSkies.js'

var partners: Map<string, AbstractPartner> = new Map()

export function initPartners(schemas: SchemaRegistry, collections: CollectionRegistry, _version: VersionId) {
	schemas.register(`cosmos:dimension`, StringNode(collections, {validator: "resource", params: {pool: "$dimension", allowTag: false, allowUnknown: true}}))
	
	var ch = new CosmicHorizons(schemas, collections).init();
	var vs = new ValkyrienSkies(schemas, collections).init();
	var ad = new AdAstra(schemas, collections).init();
	var gn = new Genesis(schemas, collections).init();

	partners.set(ch.getId(), ch);
	partners.set(vs.getId(), vs);
	partners.set(ad.getId(), ad);
	partners.set(gn.getId(), gn)

}

export function getRegisteredPartner(id: string): AbstractPartner  | undefined {
	return partners.get(id);
}

// Don't ask about the typescript nonesense, all I know is that it works
// Future me: I know how this works now :D

/**
 * If `pathOrFunction` is a `string[]`, then the conditional node will traverse from the top of its tree down the path.
 * For example, a value of `["root", "value", "child"]` would get the `root`->`value`->`child` node in the tree. 
 * Then, that node is checked against `conditionValue` to see if this node should be enabled or not.
 * 
 * As an example, here is a StringNode that will only be enabled if the neighboring node is true:
 * 
 * ```typescript
 * firstNode: BooleanNode(),
 * secondNode: ConditionalNode(StringNode(), ["firstNode"], true)
 * ```
 * 
 * A more complex example:
 *  
 * ```typescript
 * firstNode: ObjectNode({
 * 	subNode: StringNode()
 * }),
 * secondNode: ConditionalNode(StringNode(), ["firstNode", "subNode"], "trueValue")
 * ```
 *  
 * You can also specify `pathOrFunction` as a lambda, to control the condition directly instead of the path traversal. 
 * This is useful if you have multiple conditions you want to chain together, or conditions unrelated to other nodes.
 * 
 * An example:
 * 
 * ```typescript
 * firstNode: StringNode()
 * secondNode: ConditionalNode(StringNode(), (path) => {
 * 	return (path.push("firstNode").get() === "trueOne") || (path.push("firstNode").get() === "trueTwo")
 * })
 * ```
 * 
 * @param node The base node to add a condition to
 * @param pathOrFunction The path `string[]` to traverse before checking the condition value, or a manual lambda to check against
 * @param conditionValue If `pathOrFunction` is a `string[]`, then the item down that chain in the path will be checked with `===` against this value
 * @returns A new node
 */
export function ConditionalNode<T extends INode<any>>(node: T, pathOrFunction: string[] | ((path: ModelPath) => boolean), conditionValue: any = undefined): T {
	if (typeof(pathOrFunction) === "function") {
		return Mod(node, {
			enabled: pathOrFunction
		}) as T;
	} else {
		return Mod(node, {
			enabled: path => pathOrFunction.reduce((p, segment) => p.push(segment), path).get() === conditionValue
		}) as T;
	}
	
}
