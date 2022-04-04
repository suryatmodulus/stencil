import * as d from '@stencil/core/declarations';
import { updateTypeMemberNames } from '../types-utils';
import { stubComponentCompilerMeta } from './ComponentCompilerMeta.stub';
import { stubTypesImportData } from './TypesImportData.stub';
import { stubComponentCompilerTypeReference } from './ComponentCompilerTypeReference.stub';

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
