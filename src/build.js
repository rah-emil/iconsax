import { promises as fs } from 'fs';
import camelcase from 'camelcase';
import { promisify } from 'util';
import rimrafCallback from 'rimraf';
import * as babel from '@babel/core';
import { compile as compileVue } from '@vue/compiler-dom';
import path from 'path';

const rimraf = promisify(rimrafCallback);

const transformVue = (svg) => {
  let { code } = compileVue(svg, {
    mode: 'module',
  });

  return code.replace('export function', 'export default function');
};

const getIcons = async (style) => {
  let files = await fs.readdir(`./dist/icons/${style}`);

  return Promise.all(
    files.map(async (file) => ({
      svg: await fs.readFile(`./dist/icons/${style}/${file}`, 'utf8'),
      componentName: `${camelcase(file.replace(/\.svg$/, '').replace(/[^a-zA-Z0-9_]/g, ''), {
        pascalCase: true,
      })}Icon`,
    }))
  );
};

const exportAll = (icons, includeExtension = true) => {
  return icons
    .map(({ componentName }) => {
      let extension = includeExtension ? '.js' : '';
      return `export { default as ${componentName} } from './${componentName}${extension}'`;
    })
    .join('\n');
};

const ensureWrite = async (file, text) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, text, 'utf8');
};

const ensureWriteJson = async (file, json) => {
  await ensureWrite(file, JSON.stringify(json, null, 2));
};

const buildIcons = async (style) => {
  let outDir = `./dist/${style}`;
  let icons = await getIcons(style);

  await Promise.all(
    icons.flatMap(async ({ componentName, svg }) => {
      let content = await transformVue(svg);
      let types = `import type { FunctionalComponent, HTMLAttributes, VNodeProps } from 'vue';\ndeclare const ${componentName}: FunctionalComponent<HTMLAttributes & VNodeProps>;\nexport default ${componentName};\n`;

      return [
        ensureWrite(`${outDir}/${componentName}.js`, content),
        ...(types ? [ensureWrite(`${outDir}/${componentName}.d.ts`, types)] : []),
      ];
    })
  );

  await ensureWrite(`${outDir}/index.js`, exportAll(icons));
  await ensureWrite(`${outDir}/index.d.ts`, exportAll(icons, false));
  await ensureWriteJson(`${outDir}/icons.json`, icons);
  console.warn(icons);
};

const main = async () => {
  const esmPackageJson = { type: 'module', sideEffects: false };

  console.log(`Building package...`);

  await Promise.all([
    rimraf(`./dist/bold/*`),
    rimraf(`./dist/broken/*`),
    rimraf(`./dist/bulk/*`),
    rimraf(`./dist/linear/*`),
    rimraf(`./dist/outline/*`),
    rimraf(`./dist/twotone/*`),
  ]);

  await Promise.all([
    buildIcons('bold'),
    buildIcons('broken'),
    buildIcons('bulk'),
    buildIcons('linear'),
    buildIcons('outline'),
    buildIcons('twotone'),

    ensureWriteJson(`./dist/bold/package.json`, esmPackageJson),
    ensureWriteJson(`./dist/broken/package.json`, esmPackageJson),
    ensureWriteJson(`./dist/bulk/package.json`, esmPackageJson),
    ensureWriteJson(`./dist/linear/package.json`, esmPackageJson),
    ensureWriteJson(`./dist/outline/package.json`, esmPackageJson),
    ensureWriteJson(`./dist/twotone/package.json`, esmPackageJson),
  ]);

  console.log(`Finished building package.`);
};

main()
