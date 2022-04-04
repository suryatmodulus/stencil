import * as d from '@stencil/core/declarations';
import { updateTypeMemberNames } from '../types-utils';

describe('types-utils', () => {
  describe('updateTypeMemberNames', () => {
    // let dirnameSpy: jest.SpyInstance<ReturnType<typeof Path.dirname>, Parameters<typeof Path.dirname>>;
    // let resolveSpy: jest.SpyInstance<ReturnType<typeof Path.resolve>, Parameters<typeof Path.resolve>>;

    beforeEach(() => {
      // dirnameSpy = jest.spyOn(Path, 'dirname');
      //
      // resolveSpy = jest.spyOn(Path, 'resolve');
    });

    afterEach(() => {
      // dirnameSpy.mockRestore();
      // resolveSpy.mockRestore();
    });

    // TODO(): Build a stub for d.ComponentCompilerMeta, remove the type assertion
    const stubComponentCompilerMeta = (overrides: Partial<d.ComponentCompilerMeta> = {}): d.ComponentCompilerMeta => {
      const defaults: d.ComponentCompilerMeta = {
        events: [],
        sourceFilePath: '/some/stubbed/path/my-component.tsx',
      } as d.ComponentCompilerMeta;

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    const stubComponentCompilerTypeReference = (
      overrides: Partial<d.ComponentCompilerTypeReference> = {}
    ): d.ComponentCompilerTypeReference => {
      const defaults: d.ComponentCompilerTypeReference = {
        location: 'global',
      };

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    const stubTypesImportData = (overrides: Partial<d.TypesImportData> = {}): d.TypesImportData => {
      const defaults: d.TypesImportData = {
        // TODO: It may make sense for this to return nothing...this'll be highly coupled to tests
        Something: [
          {
            localName: '',
            importName: '',
          },
        ],
      };

      return { ...defaults, ...overrides };
    };

    it('returns the provided type when no type references exist', () => {
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeMemberNames({}, stubComponentCompilerMeta(), {}, expectedTypeName, () => 'TODO');

      expect(actualTypeName).toBe(expectedTypeName);
    });

    it('returns the provided type when no type reference matches are found', () => {
      const typeReferences: d.ComponentCompilerTypeReferences = {
        AnotherType: stubComponentCompilerTypeReference({ location: 'local', path: 'some/stubbed/path' }),
      };
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeMemberNames(
        typeReferences,
        stubComponentCompilerMeta(),
        {},
        expectedTypeName,
        () => 'TODO'
      );

      expect(actualTypeName).toBe(expectedTypeName);
    });

    it('does not attempt to resolve path-less imports', () => {
      const typeReferences: d.ComponentCompilerTypeReferences = {
        Array: stubComponentCompilerTypeReference({ location: 'global' }),
      };
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeMemberNames(
        typeReferences,
        stubComponentCompilerMeta(),
        {},
        expectedTypeName,
        () => 'TODO'
      );

      expect(actualTypeName).toBe(expectedTypeName);
    });

    // TODO Mock and test the '.', '..' paths

    it('foos', () => {
      const initialType = 'AnotherType';
      const expectedType = 'AnotherType1';
      const path = 'some/stubbed/path';

      const typeReferences: d.ComponentCompilerTypeReferences = {
        [initialType]: stubComponentCompilerTypeReference({ location: 'local', path }),
      };
      const typeImports = stubTypesImportData({
        [path]: [
          {
            localName: initialType,
            importName: expectedType,
          },
        ],
      });

      const actualTypeName = updateTypeMemberNames(
        typeReferences,
        stubComponentCompilerMeta(),
        typeImports,
        initialType,
        () => expectedType
      );

      expect(actualTypeName).toBe(expectedType);
    });

    it('foos more', () => {
      // TODO This test is kinda dumb with the way we do the mock of the extract fn now
      const typeReferences: d.ComponentCompilerTypeReferences = {
        AnotherType: stubComponentCompilerTypeReference({ location: 'local', path: 'some/stubbed/path' }),
      };
      const initialType = 'AnotherType';
      const expectedType = 'AnotherType1';
      const typeImports = stubTypesImportData({
        'some/stubbed/path': [
          {
            localName: initialType,
            importName: 'SomeOtherImportName',
          },
          {
            localName: initialType,
            importName: expectedType,
          },
        ],
      });

      const actualTypeName = updateTypeMemberNames(
        typeReferences,
        stubComponentCompilerMeta(),
        typeImports,
        initialType,
        () => expectedType
      );

      expect(actualTypeName).toBe(expectedType);
    });
  });
});
