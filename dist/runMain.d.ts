import type { HasCwd } from '@contentlayer2/core';
import type { AbsolutePosixFilePath, fs } from '@contentlayer2/utils';
import type { HasClock, HasConsole, OT } from '@contentlayer2/utils/effect';
import { T } from '@contentlayer2/utils/effect';
export declare const runMain: <TResult>({ tracingServiceName, verbose, useInMemoryFs, customCwd, }: {
    tracingServiceName: string;
    verbose: boolean;
    useInMemoryFs?: boolean;
    customCwd?: AbsolutePosixFilePath;
}) => (eff: T.Effect<OT.HasTracer & HasClock & HasCwd & HasConsole & fs.HasFs, unknown, TResult>) => Promise<TResult>;
//# sourceMappingURL=runMain.d.ts.map