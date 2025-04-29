import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import { initCosmicHorizons } from './CosmicHorizons.js'

export * from './CosmicHorizons.js'

export function initPartners(schemas: SchemaRegistry, collections: CollectionRegistry) {
	initCosmicHorizons(schemas, collections)
}
