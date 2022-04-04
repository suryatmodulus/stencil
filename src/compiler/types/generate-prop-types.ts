import type * as d from '../../declarations';
import { getTextDocs } from '@utils';
import { updateTypeMemberNames } from './types-utils';
/**
 * Generates type information for a series of props on a component
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the generated type metadata
 */
export const generatePropTypes = (cmpMeta: d.ComponentCompilerMeta, typeImportData: d.TypesImportData): d.TypeInfo => {
  return [
    ...cmpMeta.properties.map((cmpProp) => ({
      name: cmpProp.name,
      type: getType(cmpProp, cmpMeta, typeImportData),
      optional: cmpProp.optional,
      required: cmpProp.required,
      internal: cmpProp.internal,
      jsdoc: getTextDocs(cmpProp.docs),
    })),
    ...cmpMeta.virtualProperties.map((cmpProp) => ({
      name: cmpProp.name,
      type: cmpProp.type,
      optional: true,
      required: false,
      jsdoc: cmpProp.docs,
      internal: false,
    })),
  ];
};

/**
 * Determine the correct type name for all type(s) used by a class member annotated with `@Prop()`
 * @param cmpProp the compiler metadata for a single `@Prop()`
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the type associated with a `@Prop()`
 */
function getType(
  cmpProp: d.ComponentCompilerProperty,
  cmpMeta: d.ComponentCompilerMeta,
  typeImportData: d.TypesImportData
): string {
  return updateTypeMemberNames(
    cmpProp.complexType.references,
    cmpMeta,
    typeImportData,
    cmpProp.complexType.original,
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
  return typeAlias.localName === currentTypeName && typeAlias.importName ? typeAlias.importName : currentTypeName;
};
