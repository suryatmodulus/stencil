import type * as d from '../../declarations';
import { getTextDocs } from '@utils';
import { updateTypeMemberNames } from './types-utils';

/**
 * Generates type information for a series of methods on a component
 * @param cmpMeta TODO
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the generated type metadata
 */
export const generateMethodTypes = (
  cmpMeta: d.ComponentCompilerMeta,
  typeImportData: d.TypesImportData
): d.TypeInfo => {
  return [
    ...cmpMeta.methods.map((cmpMethod) => ({
      name: cmpMethod.name,
      type: getType(cmpMethod, cmpMeta, typeImportData),
      optional: false,
      required: false,
      internal: cmpMethod.internal,
      jsdoc: getTextDocs(cmpMethod.docs),
    })),
  ];
};

/**
 * Determine the correct type name for all type(s) used by a class member annotated with `@Method()`
 * @param cmpMethod the compiler metadata for a single `@Method()`
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the type associated with a `@Method()`
 */
function getType(
  cmpMethod: d.ComponentCompilerMethod,
  cmpMeta: d.ComponentCompilerMeta,
  typeImportData: d.TypesImportData
): string {
  return updateTypeMemberNames(
    cmpMethod.complexType.references,
    cmpMeta,
    typeImportData,
    cmpMethod.complexType.signature,
    updateTypeName
  );
}

/**
 * Determine whether the string representation of a type should be replaced with an alias
 * @param currentTypeName the current string representation of a type
 * @param typeAlias a type member and a potential different name associated with the type member
 * @returns the updated string representation of a type. If the type is not updated, the original type name is returned
 */
const updateTypeName = (currentTypeName: string, typeAlias: d.TypesMemberNameData): string => {
  return currentTypeName.replace(new RegExp(typeAlias.localName, 'g'), typeAlias.importName);
};
