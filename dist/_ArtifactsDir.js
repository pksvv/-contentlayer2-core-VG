import { filePathJoin, fs } from '@contentlayer2/utils';
import { pipe, T } from '@contentlayer2/utils/effect';
import { getContentlayerVersion } from '@contentlayer2/utils/node';
import { getCwd } from './cwd.js';
// import utilsPkg from '@contentlayer2/utils/package.json'
export const getDirPath = ({ cwd }) => filePathJoin(cwd, '.contentlayer');
export const mkdir = T.gen(function* ($) {
    const cwd = yield* $(getCwd);
    const dirPath = getDirPath({ cwd });
    yield* $(fs.mkdirp(dirPath));
    return dirPath;
});
export const getCacheDirPath = pipe(T.struct({
    contentlayerVersion: getContentlayerVersion(),
    cwd: getCwd,
}), T.map(({ contentlayerVersion, cwd }) => filePathJoin(getDirPath({ cwd }), '.cache', `v${contentlayerVersion}`)));
export const mkdirCache = pipe(getCacheDirPath, T.tap((_) => fs.mkdirp(_)));
//# sourceMappingURL=_ArtifactsDir.js.map