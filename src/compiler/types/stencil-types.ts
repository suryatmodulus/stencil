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

// TODO(NOW): This must be broken for small prop names
// TODO(STENCIL-000): Remove this once we have a better way to inspect parameters on a method
/**
 * Determine whether the string representation of a type should be replaced with an alias for a `@Method()`
 * @param currentTypeName the current string representation of a type
 * @param typeAlias a type member and a potential different name associated with the type member
 * @returns the updated string representation of a type. If the type is not updated, the original type name is returned
 */
const updateTypeNameForMethod = (currentTypeName: string, typeAlias: d.TypesMemberNameData): string => {
  return currentTypeName.replace(new RegExp(typeAlias.localName, 'g'), typeAlias.importName);
};

// TODO(STENCIL-000): Inline this function once `updateTypeNameForMethod` is no longer needed
/**
 * Determine whether the string representation of a type should be replaced with an alias
 * @param currentTypeName the current string representation of a type
 * @param typeAlias a type member and a potential different name associated with the type member
 * @returns the updated string representation of a type. If the type is not updated, the original type name is returned
 */
const updateTypeNameForPropAndEvent = (currentTypeName: string, typeAlias: d.TypesMemberNameData): string => {
  return typeAlias.localName === currentTypeName && typeAlias.importName ? typeAlias.importName : currentTypeName;
};

// TODO(STENCIL-000): Remove `isMethod` parameter
/**
 * Utility for ensuring that naming collisions do not appear in type declaration files for a component's props, events,
 * and methods
 * @param typeReferences all type names
 * @param typeImportData locally/imported/globally used type names, which may be used to prevent naming collisions
 * @param sourceFilePath
 * @param initialType
 * @param isMethod
 * @returns
 */
export const updateTypeIdentifierNames = (
  typeReferences: d.ComponentCompilerTypeReferences,
  typeImportData: d.TypesImportData,
  sourceFilePath: string,
  initialType: string,
  isMethod: boolean = false
): string => {
  const updateTypeName = isMethod ? updateTypeNameForMethod : updateTypeNameForPropAndEvent;
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
      importResolvedFile = resolve(dirname(sourceFilePath), importResolvedFile);
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
