import * as d from '@stencil/core/declarations';

export const stubComponentCompilerTypeReference = (
  overrides: Partial<d.ComponentCompilerTypeReference> = {}
): d.ComponentCompilerTypeReference => {
  const defaults: d.ComponentCompilerTypeReference = {
    location: 'global',
  };

  return { ...defaults, ...overrides };
};
