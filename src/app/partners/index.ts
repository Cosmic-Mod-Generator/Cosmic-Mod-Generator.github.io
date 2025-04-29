import type { CollectionRegistry, SchemaRegistry } from '@mcschema/core'
import type { VersionId } from '../services/Schemas.js'
import { initCosmicHorizons } from './CosmicHorizons.js'
import { initImmersiveWeathering } from './ImmersiveWeathering.js'
import { initNeoForge } from './NeoForge.js'
import { initObsidian } from './Obsidian.js'
import { initOhTheTreesYoullGrow } from './OhTheTreesYoullGrow.js'

export * from './CosmicHorizons.js'
export * from './ImmersiveWeathering.js'

export function initPartners(schemas: SchemaRegistry, collections: CollectionRegistry, version: VersionId) {
	initImmersiveWeathering(schemas, collections)
	initCosmicHorizons(schemas, collections)
	initNeoForge(schemas, collections, version)
	initObsidian(schemas, collections)
	initOhTheTreesYoullGrow(schemas, collections)
}
