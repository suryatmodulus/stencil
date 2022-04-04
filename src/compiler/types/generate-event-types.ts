import type * as d from '../../declarations';
import { getTextDocs, toTitleCase } from '@utils';
import { updateTypeIdentifierNames } from './stencil-types';

/**
 * Generates type information for a series of events on a component
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the generated type metadata
 */
export const generateEventTypes = (cmpMeta: d.ComponentCompilerMeta, typeImportData: d.TypesImportData): d.TypeInfo => {
  return [
    ...cmpMeta.events.map((cmpEvent) => {
      const name = `on${toTitleCase(cmpEvent.name)}`;
      const type = getEventType(cmpEvent, cmpMeta, typeImportData);
      return {
        name,
        type,
        optional: false,
        required: false,
        internal: cmpEvent.internal,
        jsdoc: getTextDocs(cmpEvent.docs),
      };
    }),
  ];
};

/**
 * Determine the correct type name for all type(s) used by a class member annotated with `@Event()`
 * @param cmpEvent the compiler metadata for a single `@Event()`
 * @param cmpMeta component runtime metadata for a single component
 * @param typeImportData import data for TypeScript types, which may be used to override existing type metadata to avoid
 * naming collisions
 * @returns the type associated with a `@Event()`
 */
const getEventType = (
  cmpEvent: d.ComponentCompilerEvent,
  cmpMeta: d.ComponentCompilerMeta,
  typeImportData: d.TypesImportData
): string => {
  if (!cmpEvent.complexType.original) {
    return 'CustomEvent';
  }
  const theType = updateTypeIdentifierNames(
    cmpEvent.complexType.references,
    cmpMeta,
    typeImportData,
    cmpEvent.complexType.original,
    updateTypeName
  );
  return `(event: CustomEvent<${theType}>) => void`;
};

/**
 * Determine whether the string representation of a type should be replaced with an alias
 * @param currentTypeName the current string representation of a type
 * @param typeAlias a type member and a potential different name associated with the type member
 * @returns the updated string representation of a type. If the type is not updated, the original type name is returned
 */
const updateTypeName = (currentTypeName: string, typeAlias: d.TypesMemberNameData): string => {
  return typeAlias.localName === currentTypeName && typeAlias.importName ? typeAlias.importName : currentTypeName;
};
