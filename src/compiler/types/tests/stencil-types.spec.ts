import * as d from '@stencil/core/declarations';
import path from 'path';
import { stubComponentCompilerMeta } from './ComponentCompilerMeta.stub';
import { stubComponentCompilerTypeReference } from './ComponentCompilerTypeReference.stub';
import { stubTypesImportData } from './TypesImportData.stub';
import { updateTypeIdentifierNames } from '../stencil-types';

describe('stencil-types', () => {
  describe('updateTypeMemberNames', () => {
    let dirnameSpy: jest.SpyInstance<ReturnType<typeof path.dirname>, Parameters<typeof path.dirname>>;
    let resolveSpy: jest.SpyInstance<ReturnType<typeof path.resolve>, Parameters<typeof path.resolve>>;

    beforeEach(() => {
      dirnameSpy = jest.spyOn(path, 'dirname');
      dirnameSpy.mockImplementation((path: string) => path);

      resolveSpy = jest.spyOn(path, 'resolve');
      resolveSpy.mockImplementation((...pathSegments: ReadonlyArray<string>) => pathSegments.join('/'));
    });

    afterEach(() => {
      dirnameSpy.mockRestore();
      resolveSpy.mockRestore();
    });

    it('returns the provided type when no type references exist', () => {
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeIdentifierNames(
        {},
        {},
        stubComponentCompilerMeta().sourceFilePath,
        expectedTypeName,
      );

      expect(actualTypeName).toBe(expectedTypeName);
    });

    it('returns the provided type when no type reference matches are found', () => {
      const typeReferences: d.ComponentCompilerTypeReferences = {
        AnotherType: stubComponentCompilerTypeReference({ location: 'local', path: 'some/stubbed/path' }),
      };
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        {},
        stubComponentCompilerMeta().sourceFilePath,
        expectedTypeName,
      );

      expect(actualTypeName).toBe(expectedTypeName);
    });

    it('does not attempt to resolve path-less imports', () => {
      const typeReferences: d.ComponentCompilerTypeReferences = {
        Array: stubComponentCompilerTypeReference({ location: 'global' }),
      };
      const expectedTypeName = 'CustomType';

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        {},
        stubComponentCompilerMeta().sourceFilePath,
        expectedTypeName,
      );

      expect(actualTypeName).toBe(expectedTypeName);
    });

    it('bars', () => {
      const initialType = 'AnotherType';
      const expectedType = 'AnotherType1';
      const path = './some/stubbed/path';

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

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        typeImports,
        stubComponentCompilerMeta().sourceFilePath,
        initialType,
      );

      expect(actualTypeName).toBe(expectedType);
    });

    it('bars2', () => {
      const initialType = 'AnotherType';
      const expectedType = 'AnotherType1';
      const path = '../some/stubbed/path';

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

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        typeImports,
        stubComponentCompilerMeta().sourceFilePath,
        initialType,
      );

      expect(actualTypeName).toBe(expectedType);
    });

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

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        typeImports,
        stubComponentCompilerMeta().sourceFilePath,
        initialType,
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

      const actualTypeName = updateTypeIdentifierNames(
        typeReferences,
        typeImports,
        stubComponentCompilerMeta().sourceFilePath,
        initialType,
      );

      expect(actualTypeName).toBe(expectedType);
    });
  });
});
