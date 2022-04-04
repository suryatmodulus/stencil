import type * as d from '../../../declarations';
import { generatePropTypes } from '../generate-prop-types';
import * as Util from '../../../utils/util';

describe('generate-prop-types', () => {
  describe('generatePropTypes', () => {
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
        properties: [],
        sourceFilePath: '/some/stubbed/path/my-component.tsx',
        virtualProperties: [],
      } as d.ComponentCompilerMeta;

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    /**
     * Generates a stub {@link ComponentCompilerProperty}. This function uses sensible defaults for the initial stub.
     * However, any field in the object may be overridden via the `overrides` field.
     * @param overrides a partial implementation of `ComponentCompilerProperty`. Any provided fields will override the
     * defaults provided by this function.
     * @returns the stubbed `ComponentCompilerProperty`
     */
    const stubComponentCompilerProperty = (
      overrides: Partial<d.ComponentCompilerProperty> = {}
    ): d.ComponentCompilerProperty => {
      const defaults: d.ComponentCompilerProperty = {
        attribute: 'my-cmp',
        complexType: {
          original: 'UserCustomPropType',
          resolved: '123 | 456',
          references: {
            UserImplementedEventType: {
              location: 'import',
              path: './resources',
            },
          },
        },
        docs: undefined,
        internal: false,
        mutable: false,
        name: 'propName',
        optional: false,
        reflect: false,
        required: false,
        type: 'number',
      };

      return { ...defaults, ...overrides };
    };

    // TODO: Separate this out
    /**
     * Generates a stub {@link ComponentCompilerVirtualProperty}. This function uses sensible defaults for the initial
     * stub. However, any field in the object may be overridden via the `overrides` field.
     * @param overrides a partial implementation of `ComponentCompilerVirtualProperty`. Any provided fields will override the
     * defaults provided by this function.
     * @returns the stubbed `ComponentCompilerVirtualProperty`
     */
    const stubComponentCompilerVirtualProperty = (
      overrides: Partial<d.ComponentCompilerVirtualProperty> = {}
    ): d.ComponentCompilerVirtualProperty => {
      const defaults: d.ComponentCompilerVirtualProperty = {
        docs: 'this is a doc string',
        name: 'virtualPropName',
        type: 'number',
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

    it('returns an empty array when no props are provided', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta();

      expect(generatePropTypes(componentMeta, stubImportTypes)).toEqual([]);
    });

    it('returns the correct type information for a single property', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        properties: [stubComponentCompilerProperty()],
      });

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'propName',
          optional: false,
          required: false,
          type: 'UserCustomPropType',
        },
      ];

      const actualTypeInfo = generatePropTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });

    it('returns the correct type information for a single virtual property', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        virtualProperties: [stubComponentCompilerVirtualProperty()],
      });

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: 'this is a doc string',
          internal: false,
          name: 'virtualPropName',
          optional: true,
          required: false,
          type: 'number',
        },
      ];

      const actualTypeInfo = generatePropTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });

    it('returns the correct type information for a concrete and virtual properties', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        properties: [stubComponentCompilerProperty()],
        virtualProperties: [stubComponentCompilerVirtualProperty()],
      });

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'propName',
          optional: false,
          required: false,
          type: 'UserCustomPropType',
        },
        {
          jsdoc: 'this is a doc string',
          internal: false,
          name: 'virtualPropName',
          optional: true,
          required: false,
          type: 'number',
        },
      ];

      const actualTypeInfo = generatePropTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });
  });
});
