import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { initCosmicHorizons } from './CosmicHorizons.js'

export * from './CosmicHorizons.js'

export function initPartners(schemas: SchemaRegistry, collections: CollectionRegistry, _version: VersionId) {
	initCosmicHorizons(schemas, collections)
}
