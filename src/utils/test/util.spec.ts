import { mockConfig } from '@stencil/core/testing';
import * as util from '../util';

describe('util', () => {
  describe('generatePreamble', () => {
    it('generates a comment with a single line preamble', () => {
      const testConfig = mockConfig();
      testConfig.preamble = 'I am Stencil';

      const result = util.generatePreamble(testConfig);

      expect(result).toBe(`/*!
 * I am Stencil
 */`);
    });

    it('generates a comment with a multi-line preamble', () => {
      const testConfig = mockConfig();
      testConfig.preamble = 'I am Stencil\nHear me roar';

      const result = util.generatePreamble(testConfig);

      expect(result).toBe(`/*!
 * I am Stencil
 * Hear me roar
 */`);
    });

    it('returns an empty string if no preamble is provided', () => {
      const testConfig = mockConfig();

      const result = util.generatePreamble(testConfig);

      expect(result).toBe('');
    });

    it('returns an empty string a null preamble is provided', () => {
      const testConfig = mockConfig();
      testConfig.preamble = null;

      const result = util.generatePreamble(testConfig);

      expect(result).toBe('');
    });

    it('returns an empty string if an empty preamble is provided', () => {
      const testConfig = mockConfig();
      testConfig.preamble = '';

      const result = util.generatePreamble(testConfig);

      expect(result).toBe('');
    });
  });

  describe('isTsFile', () => {
    it('should return true for regular .ts and .tsx files', () => {
      expect(util.isTsFile('.ts')).toEqual(true);
      expect(util.isTsFile('.tsx')).toEqual(true);
      expect(util.isTsFile('foo.ts')).toEqual(true);
      expect(util.isTsFile('foo.tsx')).toEqual(true);
      expect(util.isTsFile('foo.bar.ts')).toEqual(true);
      expect(util.isTsFile('foo.bar.tsx')).toEqual(true);
      expect(util.isTsFile('foo/bar.ts')).toEqual(true);
      expect(util.isTsFile('foo/bar.tsx')).toEqual(true);
    });

    it('should return false for other file extentions', () => {
      expect(util.isTsFile('foo.js')).toEqual(false);
      expect(util.isTsFile('foo.doc')).toEqual(false);
      expect(util.isTsFile('foo.css')).toEqual(false);
      expect(util.isTsFile('foo.html')).toEqual(false);
    });

    it('should return false for .d.ts and .d.tsx files', () => {
      expect(util.isTsFile('foo/bar.d.ts')).toEqual(false);
      expect(util.isTsFile('foo/bar.d.tsx')).toEqual(false);
    });

    it('should return false for .spec.ts and .spec.tsx files', () => {
      expect(util.isTsFile('foo/bar.spec.ts')).toEqual(false);
      expect(util.isTsFile('foo/bar.spec.tsx')).toEqual(false);
    });

    it('should return true for d.ts[x] and spec.ts[x] files', () => {
      expect(util.isTsFile('d.ts')).toEqual(true);
      expect(util.isTsFile('d.tsx')).toEqual(true);
      expect(util.isTsFile('spec.ts')).toEqual(true);
      expect(util.isTsFile('spec.tsx')).toEqual(true);
    });

    it('should be case insenitive', () => {
      expect(util.isTsFile('Foo.TS')).toEqual(true);
      expect(util.isTsFile('Foo.tSx')).toEqual(true);
      expect(util.isTsFile('foo/bar.D.ts')).toEqual(false);
      expect(util.isTsFile('foo/bar.D.tsx')).toEqual(false);
      expect(util.isTsFile('foo/bar.SpEc.ts')).toEqual(false);
      expect(util.isTsFile('foo/bar.sPEC.tsx')).toEqual(false);
    });
  });

  describe('isDtsFile', () => {
    it('should return true for .d.ts files', () => {
      expect(util.isDtsFile('.d.ts')).toEqual(true);
      expect(util.isDtsFile('foo.d.ts')).toEqual(true);
      expect(util.isDtsFile('foo/bar.d.ts')).toEqual(true);
    });

    it('should return false for all other file types', () => {
      expect(util.isDtsFile('.k.ts')).toEqual(false);
      expect(util.isDtsFile('foo.d.doc')).toEqual(false);
      expect(util.isDtsFile('foo/bar.txt')).toEqual(false);
      expect(util.isDtsFile('foo.spec.ts')).toEqual(false);
    });

    it('should be case insensitive', () => {
      expect(util.isDtsFile('foo/bar.D.tS')).toEqual(true);
    });
  });

  describe('isJsFile', () => {
    it('should return true for regular .js files', () => {
      expect(util.isJsFile('.js')).toEqual(true);
      expect(util.isJsFile('foo.js')).toEqual(true);
      expect(util.isJsFile('foo/bar.js')).toEqual(true);
      expect(util.isJsFile('spec.js')).toEqual(true);
    });

    it('should return false for other file extentions', () => {
      expect(util.isJsFile('.jsx')).toEqual(false);
      expect(util.isJsFile('foo.txt')).toEqual(false);
      expect(util.isJsFile('foo/bar.css')).toEqual(false);
    });

    it('should return false for .spec.js and .spec.jsx files', () => {
      expect(util.isJsFile('.spec.js')).toEqual(false);
      expect(util.isJsFile('foo.spec.js')).toEqual(false);
      expect(util.isJsFile('foo/bar.spec.js')).toEqual(false);
    });

    it('should be case insenitive', () => {
      expect(util.isJsFile('.Js')).toEqual(true);
      expect(util.isJsFile('foo.JS')).toEqual(true);
      expect(util.isJsFile('foo/bar.jS')).toEqual(true);
    });
  });

  describe('hasFileExtension', () => {
    it('should return true for .scss and .sass files', () => {
      expect(util.hasFileExtension('.scss', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo.scss', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo/bar.scss', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('.sass', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo.sass', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo/bar.sass', ['scss', 'sass'])).toEqual(true);
    });

    it('should return false for other types of files', () => {
      expect(util.hasFileExtension('.stss', ['scss', 'sass'])).toEqual(false);
      expect(util.hasFileExtension('foo.html', ['scss', 'sass'])).toEqual(false);
      expect(util.hasFileExtension('foo/bar.css', ['scss', 'sass'])).toEqual(false);
    });

    it('should be case insensitive', () => {
      expect(util.hasFileExtension('.sCss', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo.SCSS', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('.sAss', ['scss', 'sass'])).toEqual(true);
      expect(util.hasFileExtension('foo/bar.saSS', ['scss', 'sass'])).toEqual(true);
    });
  });

  it('createJsVarName', () => {
    expect(util.createJsVarName('./scoped-style-import.css?tag=my-button&encapsulation=scoped')).toBe(
      'scopedStyleImportCss'
    );
    expect(util.createJsVarName('./scoped-style-import.css#hash')).toBe('scopedStyleImportCss');
    expect(util.createJsVarName('./scoped-style-import.css&data')).toBe('scopedStyleImportCss');
    expect(util.createJsVarName('./scoped-style-import.css=data')).toBe('scopedStyleImportCss');
    expect(util.createJsVarName('@ionic/core')).toBe('ionicCore');
    expect(util.createJsVarName('@ionic\\core')).toBe('ionicCore');
    expect(util.createJsVarName('88mph')).toBe('_88mph');
    expect(util.createJsVarName('Doc.brown&')).toBe('docBrown');
    expect(util.createJsVarName('  Doc!  Brown?  ')).toBe('docBrown');
    expect(util.createJsVarName('doc---Brown')).toBe('docBrown');
    expect(util.createJsVarName('doc-brown')).toBe('docBrown');
    expect(util.createJsVarName('DocBrown')).toBe('docBrown');
    expect(util.createJsVarName('Doc')).toBe('doc');
    expect(util.createJsVarName('doc')).toBe('doc');
    expect(util.createJsVarName('AB')).toBe('aB');
    expect(util.createJsVarName('Ab')).toBe('ab');
    expect(util.createJsVarName('a')).toBe('a');
    expect(util.createJsVarName('A')).toBe('a');
    expect(util.createJsVarName('    ')).toBe('');
    expect(util.createJsVarName('')).toBe('');
    expect(util.createJsVarName(null)).toBe(null);
  });
});
