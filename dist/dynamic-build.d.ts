import type { AbsolutePosixFilePath } from '@contentlayer2/utils';
import { OT, T } from '@contentlayer2/utils/effect';
import type { SourceFetchDataErrorJSON, SourceProvideSchemaErrorJSON } from './errors.js';
import { ConfigReadError } from './errors.js';
import type { DocumentGen } from './gen.js';
import type { Config } from './getConfig/index.js';
export declare const dynamicBuildFromCompiledConfigMain: ({ compiledConfigPath, esbuildHash, verbose, }: {
    compiledConfigPath: AbsolutePosixFilePath;
    esbuildHash: string;
    verbose: boolean;
}) => Promise<{
    allDocuments: DocumentGen[];
} & Record<string, import("./data-types.js").Document[]>>;
export declare const dynamicBuildFromCompiledConfig: ({ compiledConfigPath, esbuildHash, verbose, }: {
    compiledConfigPath: AbsolutePosixFilePath;
    esbuildHash: string;
    verbose: boolean;
}) => T.Effect<import("@contentlayer2/utils/effect").Has<import("@contentlayer2/utils/effect/ConsoleService.js").ConsoleService> & import("@contentlayer2/utils/effect").Has<import("@effect-ts/system/Clock/index.js").Clock> & OT.HasTracer & import("@contentlayer2/utils/effect").HasConsole & import("@contentlayer2/utils/effect").HasClock & import("./cwd.js").HasCwd & import("@contentlayer2/utils/fs_.js").HasFs & import("@contentlayer2/utils/effect").Has<OT.Tracer>, ConfigReadError | import("./errors.js").SourceFetchDataError | import("./errors.js").SourceProvideSchemaError, DataExports>;
type RuntimeDeps = {
    contentlayerVersion: string;
    cwd: AbsolutePosixFilePath;
};
export type FetchContentResult = {
    _tag: 'Error';
    error: SourceFetchDataErrorJSON | SourceProvideSchemaErrorJSON;
} | {
    _tag: 'Data';
    data: DataExports;
};
export declare const dynamicBuildMain: ({ config, verbose, runtimeDeps, }: {
    config: Config;
    verbose: boolean;
    runtimeDeps: RuntimeDeps;
}) => Promise<FetchContentResult>;
export declare const dynamicBuild: ({ config, verbose }: {
    config: Config;
    verbose: boolean;
}) => T.Effect<OT.HasTracer & import("@contentlayer2/utils/effect").HasConsole & import("@contentlayer2/utils/effect").HasClock & import("./cwd.js").HasCwd & import("@contentlayer2/utils/fs_.js").HasFs & import("@contentlayer2/utils/effect").Has<OT.Tracer>, import("./errors.js").SourceFetchDataError | import("./errors.js").SourceProvideSchemaError, DataExports>;
export type DataExports = {
    allDocuments: DocumentGen[];
} & Record<string, DocumentGen[]>;
export {};
//# sourceMappingURL=dynamic-build.d.ts.map