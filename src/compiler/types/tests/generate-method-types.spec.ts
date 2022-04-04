import type * as d from '../../../declarations';
import { generateMethodTypes } from '../generate-method-types';
import * as Util from '../../../utils/util';

describe('generate-method-types', () => {
  describe('generateMethodTypes', () => {
    let getTextDocsSpy: jest.SpyInstance<ReturnType<typeof Util.getTextDocs>, Parameters<typeof Util.getTextDocs>>;

    beforeEach(() => {
      getTextDocsSpy = jest.spyOn(Util, 'getTextDocs');
      getTextDocsSpy.mockReturnValue('');
    });

    afterEach(() => {
      getTextDocsSpy.mockRestore();
    });

    // TODO(): Build a stub for d.ComponentCompilerMeta, remove the type assertion
    const stubComponentCompilerMeta = (overrides: Partial<d.ComponentCompilerMeta> = {}): d.ComponentCompilerMeta => {
      const defaults: d.ComponentCompilerMeta = {
        methods: [],
        sourceFilePath: '/some/stubbed/path/my-component.tsx',
      } as d.ComponentCompilerMeta;

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    /**
     * Generates a stub {@link ComponentCompilerMethod}. This function uses sensible defaults for the initial stub.
     * However, any field in the object may be overridden via the `overrides` field.
     * @param overrides a partial implementation of `ComponentCompilerMethod`. Any provided fields will override the
     * defaults provided by this function.
     * @returns the stubbed `ComponentCompilerMethod`
     */
    const stubComponentCompilerMethod = (
      overrides: Partial<d.ComponentCompilerMethod> = {}
    ): d.ComponentCompilerMethod => {
      const defaults: d.ComponentCompilerMethod = {
        name: 'myMethod',
        internal: false,
        complexType: {
          parameters: [{ tags: [], text: '' }],
          references: { Foo: { location: 'import', path: './resources' } },
          return: 'Promise<void>',
          signature: '(name: Foo) => Promise<void>',
        },
        docs: undefined,
      };

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    const stubTypesImportData = (overrides: Partial<d.TypesImportData> = {}): d.TypesImportData => {
      const defaults: d.TypesImportData = {
        // TODO: Array
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

    it('returns an empty array when no methods are provided', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta();

      expect(generateMethodTypes(componentMeta, stubImportTypes)).toEqual([]);
    });

    it('returns the correct type info for a single method', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMethod = stubComponentCompilerMethod();
      const componentMeta = stubComponentCompilerMeta({
        methods: [componentMethod],
      });

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'myMethod',
          optional: false,
          required: false,
          type: '(name: Foo) => Promise<void>',
        },
      ];

      const actualTypeInfo = generateMethodTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });

    it('returns the correct type info for multiple methods', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMethod1 = stubComponentCompilerMethod();
      const componentMethod2 = stubComponentCompilerMethod({
        name: 'myOtherMethod',
        internal: true,
        complexType: {
          parameters: [{ tags: [], text: '' }],
          references: { Bar: { location: 'local', path: './other-resources' } },
          return: 'Promise<boolean>',
          signature: '(age: Bar) => Promise<boolean>',
        },
        docs: undefined,
      });
      const componentMeta = stubComponentCompilerMeta({
        methods: [componentMethod1, componentMethod2],
      });

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'myMethod',
          optional: false,
          required: false,
          type: '(name: Foo) => Promise<void>',
        },
        {
          jsdoc: '',
          internal: true,
          name: 'myOtherMethod',
          optional: false,
          required: false,
          type: '(age: Bar) => Promise<boolean>',
        },
      ];

      const actualTypeInfo = generateMethodTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });
  });
});
