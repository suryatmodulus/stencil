import type * as d from '../../declarations';
import { dirname, resolve } from 'path';

/**
 * Find all referenced types by a component and add them to the `importDataObj` parameter
 * @param importDataObj key/value of type import file, each value is an array of imported types
 * @param typeCounts a map of seen types and the number of times the type has been seen
 * @param cmp the metadata associated with the component whose types are being inspected
 * @param filePath the path of the component file
 * @returns the updated import data
 */
export const updateReferenceTypeImports = (
  importDataObj: d.TypesImportData,
  typeCounts: Map<string, number>,
  cmp: d.ComponentCompilerMeta,
  filePath: string
): d.TypesImportData => {
  const updateImportReferences = updateImportReferenceFactory(typeCounts, filePath);

  return [...cmp.properties, ...cmp.events, ...cmp.methods]
    .filter(
      (cmpProp: d.ComponentCompilerProperty | d.ComponentCompilerEvent | d.ComponentCompilerMethod) =>
        cmpProp.complexType && cmpProp.complexType.references
    )
    .reduce((typesImportData: d.TypesImportData, cmpProp) => {
      return updateImportReferences(typesImportData, cmpProp.complexType.references);
    }, importDataObj);
};

/**
 * Describes a function that updates type import references for a file
 * @param typeImportData
 * @param typesReferences
 * @returns
 */
type ImportReferenceUpdater = (
  typeImportData: d.TypesImportData,
  typeReferences: { [key: string]: d.ComponentCompilerTypeReference }
) => d.TypesImportData;

/**
 * Factory function to create an `ImportReferenceUpdater` instance
 * @param typeCounts a key-value store of seen type names and the number of times the type name has been seen
 * @param filePath the path of the file containing the component whose imports are being updated
 * @returns an `ImportReferenceUpdater` instance for updating import references in the provided `filePath`
 */
const updateImportReferenceFactory = (typeCounts: Map<string, number>, filePath: string): ImportReferenceUpdater => {
  /**
   * Determines the number of times that a type identifier (name) has been used. If an identifier has been used before,
   * append the number of times the identifier has been seen to its name to avoid future naming collisions
   * @param name the identifier name to check for previous usages
   * @returns the identifier name, potentially with an integer appended to its name if it has been seen before.
   */
  function getIncrementTypeName(name: string): string {
    const counter = typeCounts.get(name);
    if (counter === undefined) {
      typeCounts.set(name, 1);
      return name;
    }
    typeCounts.set(name, counter + 1);
    return `${name}${counter}`;
  }

  return (
    typeImportData: d.TypesImportData,
    typeReferences: { [key: string]: d.ComponentCompilerTypeReference }
  ): d.TypesImportData => {
    Object.keys(typeReferences)
      .map((typeName) => {
        return [typeName, typeReferences[typeName]];
      })
      .forEach(([typeName, typeReference]: [string, d.ComponentCompilerTypeReference]) => {
        let importResolvedFile: string;

        // If global then there is no import statement needed
        if (typeReference.location === 'global') {
          return;

          // If local then import location is the current file
        } else if (typeReference.location === 'local') {
          importResolvedFile = filePath;
        } else if (typeReference.location === 'import') {
          importResolvedFile = typeReference.path;
        }

        // If this is a relative path make it absolute
        if (importResolvedFile.startsWith('.')) {
          importResolvedFile = resolve(dirname(filePath), importResolvedFile);
        }
        typeImportData[importResolvedFile] = typeImportData[importResolvedFile] || [];

        // If this file already has a reference to this type move on
        if (typeImportData[importResolvedFile].find((df) => df.localName === typeName)) {
          return;
        }

        const newTypeName = getIncrementTypeName(typeName);
        typeImportData[importResolvedFile].push({
          localName: typeName,
          importName: newTypeName,
        });
      });

    return typeImportData;
  };
};
