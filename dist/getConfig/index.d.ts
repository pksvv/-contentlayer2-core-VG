import type { AbsolutePosixFilePath } from '@contentlayer2/utils';
import { fs } from '@contentlayer2/utils';
import type { E } from '@contentlayer2/utils/effect';
import { OT, S, T } from '@contentlayer2/utils/effect';
import type { GetContentlayerVersionError } from '@contentlayer2/utils/node';
import type { HasCwd } from '../cwd.js';
import type { EsbuildBinNotFoundError } from '../errors.js';
import { ConfigNoDefaultExportError, ConfigReadError, NoConfigFoundError } from '../errors.js';
import type { SourcePlugin } from '../plugin.js';
import * as esbuild from './esbuild.js';
type GetConfigError = esbuild.EsbuildError | NoConfigFoundError | fs.StatError | fs.UnknownFSError | fs.MkdirError | EsbuildBinNotFoundError | ConfigReadError | ConfigNoDefaultExportError | GetContentlayerVersionError;
export type Config = {
    source: SourcePlugin;
    esbuildHash: string;
    /** File path to the compiled Contentlayer config (usually in `.contentlayer/.cache/_some_version_/...`) */
    filePath: AbsolutePosixFilePath;
};
export declare const getConfig: ({ configPath, }: {
    /** Contentlayer config source path */
    configPath?: string;
}) => T.Effect<OT.HasTracer & HasCwd & fs.HasFs, GetConfigError, Config>;
export declare const getConfigWatch: ({ configPath: configPath_, }: {
    configPath?: string;
}) => S.Stream<OT.HasTracer & HasCwd & fs.HasFs, never, E.Either<GetConfigError, Config>>;
export {};
//# sourceMappingURL=index.d.ts.map