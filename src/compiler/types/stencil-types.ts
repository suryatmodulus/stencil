import type * as d from '../../declarations';
import { dirname, join, relative, resolve } from 'path';
import { isOutputTargetDistTypes } from '../output-targets/output-utils';
import { normalizePath } from '@utils';

/**
 * Update a type declaration file's import declarations using the module `@stencil/core`
 * @param typesDir the directory where type declaration files are expected to exist
 * @param dtsFilePath the path of the type declaration file being updated, used to derive the correct import declaration
 * module
 * @param dtsContent the content of a type declaration file to update
 * @returns the updated type declaration file contents
 */
export const updateStencilTypesImports = (typesDir: string, dtsFilePath: string, dtsContent: string): string => {
  const dir = dirname(dtsFilePath);
  // determine the relative path between the directory of the .d.ts file and the types directory. this value may result
  // in '.' if they are the same
  const relPath = relative(dir, typesDir);

  let coreDtsPath = join(relPath, CORE_FILENAME);
  if (!coreDtsPath.startsWith('.')) {
    coreDtsPath = `./${coreDtsPath}`;
  }

  coreDtsPath = normalizePath(coreDtsPath);
  if (dtsContent.includes('@stencil/core')) {
    dtsContent = dtsContent.replace(/(from\s*(:?'|"))@stencil\/core\/internal('|")/g, `$1${coreDtsPath}$2`);
    dtsContent = dtsContent.replace(/(from\s*(:?'|"))@stencil\/core('|")/g, `$1${coreDtsPath}$2`);
  }
  return dtsContent;
};


/**
 *
 * @param typeReferences
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @param initialType
 * @param updateTypeName
 * @returns
 */
export const updateTypeIdentifierNames = (
  typeReferences: d.ComponentCompilerTypeReferences,
  cmpMeta: d.ComponentCompilerMeta,
  typeImportData: d.TypesImportData,
  initialType: string,
  updateTypeName: (currentTypeName: string, typeAlias: d.TypesMemberNameData) => string
): string => {
  let theType = initialType;

  // TODO
  // if (!typeReferences.hasOwnProperty(theType)) {
  //   return theType;
  // }

  // iterate over each of the type references, as there may be >1 reference to rewrite (e.g. `@Prop() foo: Bar & Baz`)
  for (let typeName of Object.keys(typeReferences)) {
    // TODO: Move this out if we keep it
    let importResolvedFile = typeReferences[typeName].path;
    if (importResolvedFile && importResolvedFile.startsWith('.')) {
      importResolvedFile = resolve(dirname(cmpMeta.sourceFilePath), importResolvedFile);
    }

    if (!typeImportData.hasOwnProperty(importResolvedFile)) {
      continue;
    }

    for (let typesImportDatumElement of typeImportData[importResolvedFile]) {
      theType = updateTypeName(theType, typesImportDatumElement);
    }
  }
  return theType;
};


/**
 * Writes Stencil core typings file to disk for a dist-* output target
 * @param config the Stencil configuration associated with the project being compiled
 * @param compilerCtx the current compiler context
 * @returns
 */
export const copyStencilCoreDts = async (
  config: d.Config,
  compilerCtx: d.CompilerCtx
): Promise<ReadonlyArray<d.FsWriteResults>> => {
  const typesOutputTargets = config.outputTargets.filter(isOutputTargetDistTypes).filter((o) => o.typesDir);

  const srcStencilDtsPath = join(config.sys.getCompilerExecutingPath(), '..', '..', 'internal', CORE_DTS);
  const srcStencilCoreDts = await compilerCtx.fs.readFile(srcStencilDtsPath);

  return Promise.all(
    typesOutputTargets.map((o) => {
      const coreDtsFilePath = join(o.typesDir, CORE_DTS);
      return compilerCtx.fs.writeFile(coreDtsFilePath, srcStencilCoreDts, { outputTargetType: o.type });
    })
  );
};

const CORE_FILENAME = `stencil-public-runtime`;
const CORE_DTS = `${CORE_FILENAME}.d.ts`;
