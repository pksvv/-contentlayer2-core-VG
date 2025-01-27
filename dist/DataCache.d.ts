import { fs } from '@contentlayer2/utils';
import type { E } from '@contentlayer2/utils/effect';
import { OT, T } from '@contentlayer2/utils/effect';
import type { GetContentlayerVersionError } from '@contentlayer2/utils/node';
import type { HasCwd } from './cwd.js';
import type { Document } from './data-types.js';
export declare namespace DataCache {
    type Cache = {
        /**
         * A map containing all documents wrapped in a {@link CacheItem} indexed by id.
         * We're using a map/record here (instead of a simple array) since it's easier and more efficient
         * to implement cache operations (e.g. lookup, update, delete) this way.
         */
        cacheItemsMap: {
            [id: string]: CacheItem;
        };
    };
    type CacheItem = {
        document: Document;
        /**
         * Until all data types are serializable, we can't cache warnings.
         */
        hasWarnings: boolean;
        /**
         * The `documentHash` is used to determine if a document has changed and it's value-generation is implemented
         * by a given plugin (e.g. based on the last-edit date in source-files)
         */
        documentHash: string;
        documentTypeName: string;
    };
    const loadPreviousCacheFromDisk: ({ schemaHash, }: {
        schemaHash: string;
    }) => T.Effect<OT.HasTracer & HasCwd & fs.HasFs, fs.StatError | fs.ReadFileError | fs.JsonParseError | GetContentlayerVersionError, Cache | undefined>;
    const writeCacheToDisk: ({ cache, schemaHash, }: {
        cache: Cache;
        schemaHash: string;
    }) => T.Effect<OT.HasTracer & HasCwd & fs.HasFs, never, E.Either<fs.WriteFileError | fs.MkdirError | fs.JsonStringifyError | GetContentlayerVersionError, void>>;
}
//# sourceMappingURL=DataCache.d.ts.map