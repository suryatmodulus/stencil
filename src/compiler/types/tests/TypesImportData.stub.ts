import * as d from '@stencil/core/declarations';

/**
 * Generates a stub {@link TypesImportData}.
 * @param overrides a partial implementation of `ComponentCompilerMeta`. Any provided fields will override the
 * defaults provided by this function.
 * @returns the stubbed `ComponentCompilerMeta`
 */
export const stubTypesImportData = (overrides: Partial<d.TypesImportData> = {}): d.TypesImportData => {
  const defaults: d.TypesImportData = {};

  return { ...defaults, ...overrides };
};
