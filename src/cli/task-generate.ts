import type { Config } from '../declarations';
import type { CoreCompiler } from './load-compiler';
import { IS_NODE_ENV } from '../compiler/sys/environment';
import { validateComponentTag } from '@utils';

/**
 * Task to generate component boilerplate and write it to disk. This task can
 * cause the program to exit with an error under various circumstances, such as
 * being called in an inappropriate place, being asked to overwrite files that
 * already exist, etc.
 *
 * @param coreCompiler the CoreCompiler
 * @param config       the config!
 */
export const taskGenerate = async (coreCompiler: CoreCompiler, config: Config): Promise<void> => {
  if (!IS_NODE_ENV) {
    config.logger.error(`"generate" command is currently only implemented for a NodeJS environment`);
    return config.sys.exit(1);
  }

  const path = coreCompiler.path;

  if (!config.configPath) {
    config.logger.error('Please run this command in your root directory (i. e. the one containing stencil.config.ts).');
    return config.sys.exit(1);
  }

  const absoluteSrcDir = config.srcDir;

  if (!absoluteSrcDir) {
    config.logger.error(`Stencil's srcDir was not specified.`);
    return config.sys.exit(1);
  }

  const { prompt } = await import('prompts');

  const input =
    config.flags.unknownArgs.find((arg) => !arg.startsWith('-')) ||
    ((await prompt({ name: 'tagName', type: 'text', message: 'Component tag name (dash-case):' })).tagName as string);

  const { dir, base: componentName } = path.parse(input);

  const tagError = validateComponentTag(componentName);
  if (tagError) {
    config.logger.error(tagError);
    return config.sys.exit(1);
  }

  const extensionsToGenerate: GeneratableExtension[] = ['tsx', ...(await chooseFilesToGenerate())];

  const testFolder = extensionsToGenerate.some(isTest) ? 'test' : '';

  const outDir = path.join(absoluteSrcDir, 'components', dir, componentName);
  await config.sys.createDir(path.join(outDir, testFolder), { recursive: true });

  const filesToGenerate: BoilerplateFile[] = extensionsToGenerate.map((extension) => ({
    extension,
    path: getFilepathForFile(coreCompiler, outDir, componentName, extension),
  }));
  checkForOverwrite(filesToGenerate, config);

  const writtenFiles = await Promise.all(
    filesToGenerate.map((file) =>
      getBoilerplateAndWriteFile(config, file, componentName, extensionsToGenerate.includes('css'))
    )
  ).catch((error) => config.logger.error(error));

  if (!writtenFiles) {
    return config.sys.exit(1);
  }

  console.log();
  console.log(`${config.logger.gray('$')} stencil generate ${input}`);
  console.log();
  console.log(config.logger.bold('The following files have been generated:'));

  const absoluteRootDir = config.rootDir;
  writtenFiles.map((file) => console.log(`  - ${path.relative(absoluteRootDir, file)}`));
};

/**
 * Show a checkbox prompt to select the files to be generated.
 */
const chooseFilesToGenerate = async (): Promise<GeneratableExtension[]> => {
  const { prompt } = await import('prompts');
  return (
    await prompt({
      name: 'filesToGenerate',
      type: 'multiselect',
      message: 'Which additional files do you want to generate?',
      choices: [
        { value: 'css', title: 'Stylesheet (.css)', selected: true },
        { value: 'spec.tsx', title: 'Spec Test  (.spec.tsx)', selected: true },
        { value: 'e2e.ts', title: 'E2E Test (.e2e.ts)', selected: true },
      ],
    })
  ).filesToGenerate;
};

/**
 * Get a filepath for a file we want to generate!
 *
 * The filepath for a given file depends on the path, the user-supplied
 * component name, the extension, and whether we're inside of a test directory.
 */
const getFilepathForFile = (
  coreCompiler: CoreCompiler,
  path: string,
  componentName: string,
  extension: GeneratableExtension
): string =>
  isTest(extension)
    ? coreCompiler.path.join(path, 'test', `${componentName}.${extension}`)
    : coreCompiler.path.join(path, `${componentName}.${extension}`);

/**
 * Get the boilerplate for a file and write it to disk
 *
 * @param config        the current config, needed for file operations
 * @param file          the file we want to write
 * @param componentName the component name (user-supplied)
 * @param withCss       are we generating CSS?
 */
const getBoilerplateAndWriteFile = async (
  config: Config,
  file: BoilerplateFile,
  componentName: string,
  withCss: boolean
): Promise<string> => {
  const boilerplate = getBoilerplateByExtension(componentName, file.extension, withCss);
  await config.sys.writeFile(file.path, boilerplate);
  return file.path;
};

/**
 * Check to see if any of the files we plan to write already exist and would
 * therefore be overwritten if we proceed, because we'd like to not overwrite
 * people's code!
 *
 * This function will check all the filepaths and if it finds any files log an
 * error and exit with an error code. If it doesn't find anything it will just
 * exit peacefully.
 *
 * @param files  the files we want to check
 * @param config the Config object, used here to get access to `sys.readFile`
 */
const checkForOverwrite = async (files: BoilerplateFile[], config: Config): Promise<void> => {
  let alreadyPresent: string[] = [];

  await Promise.all(
    files.map(async ({ path }) => {
      if ((await config.sys.readFile(path)) === undefined) {
        alreadyPresent.push(path);
      }
    })
  );

  if (alreadyPresent.length > 0) {
    config.logger.error(
      `Generating code would overwrite the following files:\n${alreadyPresent.map((path) => `\t${path}`)}`
    );
    config.sys.exit(1);
  }
};

/**
 * Check if an extension is for a test!
 *
 * @param extension the extension!
 */
const isTest = (extension: GeneratableExtension): boolean => {
  return extension === 'e2e.ts' || extension === 'spec.tsx';
};

/**
 * Get the boilerplate for a file by its extension.
 */
const getBoilerplateByExtension = (tagName: string, extension: GeneratableExtension, withCss: boolean): string => {
  switch (extension) {
    case 'tsx':
      return getComponentBoilerplate(tagName, withCss);

    case 'css':
      return getStyleUrlBoilerplate();

    case 'spec.tsx':
      return getSpecTestBoilerplate(tagName);

    case 'e2e.ts':
      return getE2eTestBoilerplate(tagName);

    default:
      throw new Error(`Unkown extension "${extension}".`);
  }
};

/**
 * Get the boilerplate for a component.
 */
const getComponentBoilerplate = (tagName: string, hasStyle: boolean): string => {
  const decorator = [`{`];
  decorator.push(`  tag: '${tagName}',`);
  if (hasStyle) {
    decorator.push(`  styleUrl: '${tagName}.css',`);
  }
  decorator.push(`  shadow: true,`);
  decorator.push(`}`);

  return `import { Component, Host, h } from '@stencil/core';

@Component(${decorator.join('\n')})
export class ${toPascalCase(tagName)} {

  render() {
    return (
      <Host>
        <slot></slot>
      </Host>
    );
  }

}
`;
};

/**
 * Get the boilerplate for style.
 */
const getStyleUrlBoilerplate = (): string =>
  `:host {
  display: block;
}
`;

/**
 * Get the boilerplate for a spec test.
 */
const getSpecTestBoilerplate = (tagName: string): string =>
  `import { newSpecPage } from '@stencil/core/testing';
import { ${toPascalCase(tagName)} } from '../${tagName}';

describe('${tagName}', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [${toPascalCase(tagName)}],
      html: \`<${tagName}></${tagName}>\`,
    });
    expect(page.root).toEqualHtml(\`
      <${tagName}>
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </${tagName}>
    \`);
  });
});
`;

/**
 * Get the boilerplate for an E2E test.
 */
const getE2eTestBoilerplate = (name: string): string =>
  `import { newE2EPage } from '@stencil/core/testing';

describe('${name}', () => {
  it('renders', async () => {
    const page = await newE2EPage();
    await page.setContent('<${name}></${name}>');

    const element = await page.find('${name}');
    expect(element).toHaveClass('hydrated');
  });
});
`;

/**
 * Convert a dash case string to pascal case.
 */
const toPascalCase = (str: string): string =>
  str.split('-').reduce((res, part) => res + part[0].toUpperCase() + part.slice(1), '');

/**
 * Extensions available to generate.
 */
type GeneratableExtension = 'tsx' | 'css' | 'spec.tsx' | 'e2e.ts';

/**
 * A little interface to wrap up the info we need to pass around for generating
 * and writing boilerplate.
 */
interface BoilerplateFile {
  extension: GeneratableExtension;
  path: string;
}
