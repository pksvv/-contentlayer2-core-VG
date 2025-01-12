import { filePathJoin, fs, relative } from '@contentlayer2/utils';
import { Array, Chunk, Either, OT, pipe, S, T } from '@contentlayer2/utils/effect';
import { getContentlayerVersion } from '@contentlayer2/utils/node';
import { camelCase } from 'camel-case';
import * as URL from 'url';
import { ArtifactsDir } from '../ArtifactsDir.js';
import { getCwd } from '../cwd.js';
import { SuccessCallbackError } from '../errors.js';
import * as esbuild from '../getConfig/esbuild.js';
import { autogeneratedNote, getDataVariableName } from './common.js';
import { renderTypes } from './generate-types.js';
export const logGenerateInfo = (info) => T.log(`Generated ${info.documentCount} documents in .contentlayer`);
export const generateDotpkg = ({ config, verbose, }) => pipe(generateDotpkgStream({ config, verbose, isDev: false }), S.take(1), S.runCollect, T.map(Chunk.unsafeHead), T.rightOrFail, OT.withSpan('@contentlayer2/core/generation:generateDotpkg', { attributes: { verbose } }));
// TODO make sure unused old generated files are removed
export const generateDotpkgStream = ({ config, verbose, isDev, }) => {
    const writtenFilesCache = {};
    const generationOptions = { sourcePluginType: config.source.type, options: config.source.options };
    const resolveParams = pipe(T.structPar({
        schemaDef: config.source.provideSchema(config.esbuildHash),
        targetPath: ArtifactsDir.mkdir,
    }), T.either);
    // .pipe(
    //   tap((artifactsDir) => watchData && errorIfArtifactsDirIsDeleted({ artifactsDir }))
    // ),
    return pipe(S.fromEffect(resolveParams), S.chainMapEitherRight(({ schemaDef, targetPath }) => pipe(config.source.fetchData({ schemaDef, verbose }), S.mapEffectEitherRight((cache) => pipe(writeFilesForCache({ config, schemaDef, targetPath, cache, generationOptions, writtenFilesCache, isDev }), T.eitherMap(() => ({ documentCount: Object.keys(cache.cacheItemsMap).length })))), S.mapEffect((generateInfo) => pipe(successCallback(config.source.options.onSuccess), 
    // TODO remove type casting
    T.fold((error) => Either.left(error), () => generateInfo))))));
};
const successCallback = (onSuccess) => {
    if (!onSuccess)
        return T.unit;
    return pipe(getCwd, T.map((cwd) => ArtifactsDir.getDirPath({ cwd })), T.tapSync((path) => console.log('successCallback', path)), T.chain((generatedPkgPath) => T.tryCatchPromise(() => onSuccess(() => import(URL.pathToFileURL(filePathJoin(generatedPkgPath, 'generated', 'index.mjs')).href)), (error) => new SuccessCallbackError({ error }))), OT.withSpan('@contentlayer2/core/generation:successCallback'));
};
const writeFilesForCache = ({ config, cache, schemaDef, targetPath, generationOptions, writtenFilesCache, isDev, }) => pipe(T.gen(function* ($) {
    const withPrefix = (...path_) => filePathJoin(targetPath, ...path_);
    if (process.env['CL_DEBUG']) {
        yield* $(fs.mkdirp(withPrefix('.cache')));
        yield* $(T.collectAllPar([
            fs.writeFileJson({ filePath: withPrefix('.cache', 'schema.json'), content: schemaDef }),
            fs.writeFileJson({ filePath: withPrefix('.cache', 'data-cache.json'), content: cache }),
        ]));
    }
    const allCacheItems = Object.values(cache.cacheItemsMap);
    const allDocuments = allCacheItems.map((_) => _.document);
    const documentDefs = Object.values(schemaDef.documentTypeDefMap);
    const [nodeVersionMajor, nodeVersionMinor] = yield* $(T.succeedWith(() => process.versions.node.split('.').map((_) => parseInt(_, 10))));
    // NOTE: Use import attribute for `.json` files for node v18.20 and node v20.10onwards.
    const needsJsonimportAttributeStatement = nodeVersionMajor > 20 ||
        (nodeVersionMajor === 18 && nodeVersionMinor >= 20) ||
        (nodeVersionMajor === 20 && nodeVersionMinor >= 10);
    const importAttributeStatement = needsJsonimportAttributeStatement
        ? ` with { type: 'json' }`
        : ` assert { type: 'json' }`;
    const typeNameField = generationOptions.options.fieldOptions.typeFieldName;
    const dataBarrelFiles = documentDefs.map((docDef) => ({
        content: makeDataExportFile({
            docDef,
            documentIds: allDocuments.filter((_) => _[typeNameField] === docDef.name).map((_) => _._id),
            importAttributeStatement,
        }),
        filePath: withPrefix('generated', docDef.name, `_index.mjs`),
    }));
    const individualDataJsonFiles = allCacheItems.map(({ document, documentHash }) => ({
        content: JSON.stringify(document, null, 2),
        filePath: withPrefix('generated', document[typeNameField], `${idToFileName(document._id)}.json`),
        documentHash,
    }));
    const collectionDataJsonFiles = pipe(documentDefs, Array.map((documentDef) => {
        const documents = allDocuments.filter((_) => _[typeNameField] === documentDef.name);
        const jsonData = documentDef.isSingleton ? documents[0] : documents;
        return {
            content: JSON.stringify(jsonData, null, 2),
            filePath: withPrefix('generated', documentDef.name, `_index.json`),
            documentHash: documents.map((_) => _.documentHash).join(''),
        };
    }));
    const dataDirPaths = documentDefs.map((_) => withPrefix('generated', _.name));
    yield* $(T.forEachPar_([withPrefix('generated'), ...dataDirPaths], fs.mkdirp));
    const writeFile = writeFileWithWrittenFilesCache({ writtenFilesCache });
    const cwd = yield* $(getCwd);
    const bundleFilePath = withPrefix('generated', 'dynamic-build-worker.mjs');
    const relativeBundleFilePath = relative(cwd, bundleFilePath);
    const options = config.source.options;
    yield* $(T.tuplePar(writeFile({ filePath: withPrefix('package.json'), content: makePackageJson(schemaDef.hash) }), writeFile({
        filePath: withPrefix('generated', 'types.d.ts'),
        content: renderTypes({ schemaDef, generationOptions }),
        rmBeforeWrite: true,
    }), writeFile({
        filePath: withPrefix('generated', 'index.d.ts'),
        content: makeDataTypes({ schemaDef, options }),
        rmBeforeWrite: true,
    }), writeFile({
        filePath: withPrefix('generated', 'index.mjs'),
        content: makeIndexMjs({
            schemaDef,
            importAttributeStatement,
            bundleFilePath: relativeBundleFilePath,
            isDev,
            options,
        }),
    }), ...dataBarrelFiles.map(writeFile), ...individualDataJsonFiles.map(writeFile), ...collectionDataJsonFiles.map(writeFile), options.experimental.enableDynamicBuild ? makeFetchContentWorker({ config, bundleFilePath }) : T.unit));
}), OT.withSpan('@contentlayer2/core/generation/generate-dotpkg:writeFilesForCache', {
    attributes: {
        targetPath,
        cacheKeys: Object.keys(cache.cacheItemsMap),
    },
}), T.either);
const makePackageJson = (schemaHash) => {
    const packageJson = {
        name: 'dot-contentlayer',
        description: 'This package is auto-generated by Contentlayer',
        // TODO generate more meaningful version (e.g. by using Contentlayer version and schema hash)
        version: `0.0.0-${schemaHash}`,
        exports: {
            './generated': {
                import: './generated/index.mjs',
            },
        },
        typesVersions: {
            '*': {
                generated: ['./generated'],
            },
        },
    };
    return JSON.stringify(packageJson, null, 2);
};
/**
 * Remembers which files already have been written to disk.
 * If no `documentHash` was provided, the writes won't be cached.
 *
 * TODO maybe rewrite with effect-cache
 */
const writeFileWithWrittenFilesCache = ({ writtenFilesCache }) => ({ filePath, content, documentHash, rmBeforeWrite = true, }) => T.gen(function* ($) {
    // TODO also consider schema hash
    const fileIsUpToDate = documentHash !== undefined && writtenFilesCache[filePath] === documentHash;
    if (!rmBeforeWrite && fileIsUpToDate) {
        return;
    }
    if (rmBeforeWrite) {
        yield* $(fs.rm(filePath, { force: true }));
    }
    yield* $(fs.writeFile(filePath, content));
    if (documentHash) {
        writtenFilesCache[filePath] = documentHash;
    }
});
const makeDataExportFile = ({ docDef, documentIds, importAttributeStatement, }) => {
    const dataVariableName = getDataVariableName({ docDef });
    if (docDef.isSingleton) {
        const documentId = documentIds[0];
        return `\
// ${autogeneratedNote}
export { default as ${dataVariableName} } from './${idToFileName(documentId)}.json'${importAttributeStatement}
`;
    }
    const usedVariableNames = new Set();
    const isValidJsVarName = (str) => /^(?![0-9])([a-zA-Z0-9_$]+)$/.test(str);
    const makeVariableName = (id, fileIndex) => pipe(id, idToFileName, (_) => camelCase(_, { stripRegexp: /[^A-Z0-9\_]/gi }), 
    // NOTE to support file names with different alphabets, we'll fall back (e.g. to `Docname2`)
    // See https://github.com/contentlayerdev/contentlayer/issues/337
    (_) => (isValidJsVarName(_) && usedVariableNames.has(_) === false ? _ : `${docDef.name}${fileIndex}`));
    const idToVariableNameMap = new Map(documentIds.map((id, fileIndex) => {
        const variableName = makeVariableName(id, fileIndex);
        usedVariableNames.add(variableName);
        return [id, variableName];
    }));
    const docImports = documentIds
        .map((_) => `import ${idToVariableNameMap.get(_)} from './${idToFileName(_)}.json'${importAttributeStatement}`)
        .join('\n');
    return `\
// ${autogeneratedNote}

${docImports}

export const ${dataVariableName} = [${Array.from(idToVariableNameMap.values()).join(', ')}]
`;
};
const makeIndexMjs = ({ schemaDef, importAttributeStatement, bundleFilePath, options, isDev, }) => {
    const dataVariableNames = Object.values(schemaDef.documentTypeDefMap).map((docDef) => ({
        isSingleton: docDef.isSingleton,
        documentDefName: docDef.name,
        dataVariableName: getDataVariableName({ docDef }),
    }));
    const constExports = 'export { ' + dataVariableNames.map((_) => _.dataVariableName).join(', ') + ' }';
    const constImportsForAllDocuments = dataVariableNames
        .map(({ documentDefName, dataVariableName }) => isDev
        ? `import { ${dataVariableName} } from './${documentDefName}/_index.mjs'`
        : `import ${dataVariableName} from './${documentDefName}/_index.json'${importAttributeStatement}`)
        .join('\n');
    const allDocuments = dataVariableNames
        .map(({ isSingleton, dataVariableName }) => (isSingleton ? dataVariableName : `...${dataVariableName}`))
        .join(', ');
    const fetchContentStr = () => {
        if (options.experimental.enableDynamicBuild === false)
            return '';
        return `\
export const fetchContent = async (sourceKey) => {
  const { Worker } = await import('node:worker_threads')
  const path = await import('node:path')

  // This is a worker-around (pun intended) for Next.js' limitation of still running via CJS.
  const workerFilePath = path.join(process.cwd(), '${bundleFilePath}')
  const worker = new Worker(workerFilePath, { workerData: { sourceKey } })

  return new Promise((resolve, reject) => {
    worker.on('message', (data) => {
      if (data.result) {
        resolve(data.result)
      } else if (data.fatalError) {
        reject(data.fatalError)
      } else {
        reject(new Error('This should not happen'))
      }
    })
    worker.on('error', reject)
  }).finally(() => worker.terminate())
}
    `;
    };
    return `\
// ${autogeneratedNote}

export { isType } from 'contentlayer2/client'

// NOTE During development Contentlayer imports from \`.mjs\` files to improve HMR speeds.
// During (production) builds Contentlayer it imports from \`.json\` files to improve build performance.
${constImportsForAllDocuments}

${constExports}

export const allDocuments = [${allDocuments}]

${fetchContentStr()}
`;
};
// await import('${absBundleFilePath}')
export const makeDataTypes = ({ schemaDef, options }) => {
    const dataConsts = Object.values(schemaDef.documentTypeDefMap)
        .map((docDef) => [docDef, docDef.name, getDataVariableName({ docDef })])
        .map(([docDef, typeName, dataVariableName]) => `export declare const ${dataVariableName}: ${typeName}${docDef.isSingleton ? '' : '[]'}`)
        .join('\n');
    const documentTypeNames = Object.values(schemaDef.documentTypeDefMap)
        .map((docDef) => docDef.name)
        .join(', ');
    const fetchContentStr = () => {
        if (options.experimental.enableDynamicBuild === false)
            return '';
        return `\
export type FetchContentResult =
  | { _tag: 'Error', error: SourceProvideSchemaErrorJSON | SourceFetchDataErrorJSON }
  | { _tag: 'Data', data: DataExports }

export declare const fetchContent: (sourceKey?: string) => Promise<FetchContentResult>
    `;
    };
    return `\
// ${autogeneratedNote}

import { ${documentTypeNames}, DocumentTypes, DataExports } from './types'
import { SourceProvideSchemaErrorJSON, SourceFetchDataErrorJSON } from 'contentlayer2/core'

export * from './types'

${dataConsts}

export declare const allDocuments: DocumentTypes[]

${fetchContentStr()}
`;
};
const idToFileName = (id) => leftPadWithUnderscoreIfStartsWithNumber(id).replace(/\//g, '__');
const leftPadWithUnderscoreIfStartsWithNumber = (str) => {
    if (/^[0-9]/.test(str)) {
        return '_' + str;
    }
    return str;
};
// const errorIfArtifactsDirIsDeleted = ({ artifactsDir }: { artifactsDir: string }) => {
//   watch(artifactsDir, async (event) => {
//     if (event === 'rename' && !(await fileOrDirExists(artifactsDir))) {
//       console.error(`Seems like the target directory (${artifactsDir}) was deleted. Please restart the command.`)
//       process.exit(1)
//     }
//   })
// }
const makeFetchContentWorker = ({ config, bundleFilePath, }) => T.gen(function* ($) {
    const contentlayerVersion = yield* $(getContentlayerVersion());
    const cwd = yield* $(getCwd);
    const scriptContent = /*ts*/ `\
import 'source-map-support/register'

import { workerData, parentPort } from 'node:worker_threads'
import { dynamicBuildMain } from '@contentlayer2/core'
import sourcePromise from '${config.filePath}'

const main = async () => {
  const source = await sourcePromise(workerData.sourceKey)

  const config = {
    source,
    esbuildHash: '${config.esbuildHash}',
    filePath: '${config.filePath}',
  }

  const runtimeDeps = {
    contentlayerVersion: '${contentlayerVersion}',
    cwd: '${cwd}',
  }

  try {
    const dataExports = await dynamicBuildMain({ config, verbose: true, runtimeDeps })
    parentPort.postMessage({ result: dataExports })
  } catch (err) {
    parentPort.postMessage({ fatalError: err })
    throw err
  }
}

main().catch((err) => {
  console.error('Error in Contentlayer worker thread')
  console.error(err)
})

`;
    yield* $(pipe(esbuild.esbuildOnce({
        stdin: {
            contents: scriptContent,
            resolveDir: cwd,
        },
        platform: 'node',
        target: 'es2020',
        format: 'esm',
        bundle: true,
        banner: {
            js: /*ts*/ `\
import { createRequire as topLevelCreateRequire } from 'module';
const require = topLevelCreateRequire(import.meta.url);
const __dirname = '__SET_BY_ESBUILD__';
              `,
        },
        loader: {
            '.node': 'file',
        },
        external: [
            '@opentelemetry/exporter-trace-otlp-grpc',
            'fetch-blob', // needed for `mdx-bundler`
        ],
        plugins: [deduplicateContentlayerImportsPlugin()],
        outfile: bundleFilePath,
    }), T.tap((result) => (result.warnings.length > 0 ? T.log(result.warnings) : T.unit))));
});
/** Needed as workaround for https://github.com/evanw/esbuild/issues/1420 */
const deduplicateContentlayerImportsPlugin = () => ({
    name: 'deduplicate-contentlayer-imports',
    setup: (build) => {
        const filter = /\@contentlayer2\/[a-z-]+/;
        const namespace = 'deduplicate-contentlayer-imports-ns';
        build.onResolve({ filter: /.+/ }, async ({ path, ...args }) => {
            if (args.namespace === namespace)
                return;
            if (path.match(filter)) {
                const result = await build.resolve(path, { ...args, namespace });
                if (result.path.match(/\@contentlayer2\/[a-z-]+\/src\//)) {
                    result.path = result.path.replace('/src/', '/dist/');
                    result.path = result.path.replace(/\.ts$/, '.js');
                }
                return result;
            }
            return undefined;
        });
    },
});
//# sourceMappingURL=generate-dotpkg.js.map