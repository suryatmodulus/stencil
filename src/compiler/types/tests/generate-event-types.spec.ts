import type * as d from '../../../declarations';
import { generateEventTypes } from '../generate-event-types';
import * as UtilHelpers from '../../../utils/helpers';
import * as Util from '../../../utils/util';

describe('generate-event-types', () => {
  describe('generateEventTypes', () => {
    let getTextDocsSpy: jest.SpyInstance<ReturnType<typeof Util.getTextDocs>, Parameters<typeof Util.getTextDocs>>;
    let toTitleCaseSpy: jest.SpyInstance<
      ReturnType<typeof UtilHelpers.toTitleCase>,
      Parameters<typeof UtilHelpers.toTitleCase>
    >;

    beforeEach(() => {
      getTextDocsSpy = jest.spyOn(Util, 'getTextDocs');
      getTextDocsSpy.mockReturnValue('');

      toTitleCaseSpy = jest.spyOn(UtilHelpers, 'toTitleCase');
      toTitleCaseSpy.mockImplementation((_name: string) => 'MyEvent');
    });

    afterEach(() => {
      getTextDocsSpy.mockRestore();
      toTitleCaseSpy.mockRestore();
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
    /**
     * Generates a stub {@link ComponentCompilerEvent}. This function uses sensible defaults for the initial stub.
     * However, any field in the object may be overridden via the `overrides` field.
     * @param overrides a partial implementation of `ComponentCompilerEvent`. Any provided fields will override the
     * defaults provided by this function.
     * @returns the stubbed `ComponentCompilerEvent`
     */
    const stubComponentCompilerEvent = (
      overrides: Partial<d.ComponentCompilerEvent> = {}
    ): d.ComponentCompilerEvent => {
      const defaults: d.ComponentCompilerEvent = {
        bubbles: true,
        cancelable: true,
        composed: true,
        internal: false,
        name: 'myEvent',
        method: 'myEvent',
        complexType: {
          original: 'UserImplementedEventType',
          resolved: '"foo" | "bar"',
          references: {
            UserImplementedEventType: {
              location: 'import',
              path: './resources',
            },
          },
        },
        docs: undefined,
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

    it('returns an empty array when no events are provided', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta();

      expect(generateEventTypes(componentMeta, stubImportTypes)).toEqual([]);
    });

    it('prefixes the event name with "on"', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].name).toBe('onMyEvent');
    });

    it('derives a generic CustomEvent from the original type', () => {
      const stubImportTypes = stubTypesImportData();
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].type).toBe('(event: CustomEvent<UserImplementedEventType>) => void');
    });

    it('derives CustomEvent type when there is no original typing field', () => {
      const stubImportTypes = stubTypesImportData();
      const componentEvent = stubComponentCompilerEvent({
        complexType: {
          original: '',
          resolved: '',
          references: {},
        },
      });
      const componentMeta = stubComponentCompilerMeta({
        events: [componentEvent],
      });

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toHaveLength(1);
      expect(actualTypeInfo[0].type).toBe('CustomEvent');
    });

    it('returns the correct type info for a single event', () => {
      const componentMeta = stubComponentCompilerMeta({
        events: [stubComponentCompilerEvent()],
      });
      const stubImportTypes = stubTypesImportData();

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'onMyEvent',
          optional: false,
          required: false,
          type: '(event: CustomEvent<UserImplementedEventType>) => void',
        },
      ];

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });

    it('returns the correct type info for multiple events', () => {
      toTitleCaseSpy.mockReturnValueOnce('MyEvent');
      toTitleCaseSpy.mockReturnValueOnce('AnotherEvent');

      const componentEvent1 = stubComponentCompilerEvent();
      const componentEvent2 = stubComponentCompilerEvent({
        internal: true,
        name: 'anotherEvent',
        method: 'anotherEvent',
        complexType: {
          original: '',
          resolved: '',
          references: {},
        },
      });
      const componentMeta = stubComponentCompilerMeta({
        events: [componentEvent1, componentEvent2],
      });
      const stubImportTypes = stubTypesImportData();

      const expectedTypeInfo: d.TypeInfo = [
        {
          jsdoc: '',
          internal: false,
          name: 'onMyEvent',
          optional: false,
          required: false,
          type: '(event: CustomEvent<UserImplementedEventType>) => void',
        },
        {
          jsdoc: '',
          internal: true,
          name: 'onAnotherEvent',
          optional: false,
          required: false,
          type: 'CustomEvent',
        },
      ];

      const actualTypeInfo = generateEventTypes(componentMeta, stubImportTypes);

      expect(actualTypeInfo).toEqual(expectedTypeInfo);
    });
  });
});
