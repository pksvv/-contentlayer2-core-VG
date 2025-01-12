import type { AbsolutePosixFilePath } from '@contentlayer2/utils';
import { fs } from '@contentlayer2/utils';
import type { OT } from '@contentlayer2/utils/effect';
import { T } from '@contentlayer2/utils/effect';
import type { GetContentlayerVersionError } from '@contentlayer2/utils/node';
import type { HasCwd } from './cwd.js';
export declare const getDirPath: ({ cwd }: {
    cwd: AbsolutePosixFilePath;
}) => AbsolutePosixFilePath;
export declare const mkdir: T.Effect<OT.HasTracer & HasCwd & fs.HasFs, fs.MkdirError, AbsolutePosixFilePath>;
export declare const getCacheDirPath: T.Effect<OT.HasTracer & HasCwd & fs.HasFs, GetContentlayerVersionError, AbsolutePosixFilePath>;
export declare const mkdirCache: T.Effect<OT.HasTracer & HasCwd & fs.HasFs, fs.MkdirError | GetContentlayerVersionError, AbsolutePosixFilePath>;
//# sourceMappingURL=_ArtifactsDir.d.ts.map