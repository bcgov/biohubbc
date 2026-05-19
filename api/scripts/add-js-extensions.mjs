import fs from 'node:fs/promises';
import path from 'node:path';

const distDir = new URL('../dist', import.meta.url);
const runtimeExtensions = new Set(['.js', '.mjs', '.cjs', '.json', '.node']);

const needsJsExtension = (specifier) => {
  const isRelative = specifier.startsWith('./') || specifier.startsWith('../');
  // dayjs ships plugins as files under node_modules; Node ESM needs explicit ".js".
  const isDayjsPlugin = specifier.startsWith('dayjs/plugin/');

  if (!isRelative && !isDayjsPlugin) {
    return false;
  }

  // Treat only real Node-resolvable runtime extensions as complete.
  // Specifiers like "./foo.interface" still need ".js" appended.
  const currentExtension = path.extname(specifier);
  return !runtimeExtensions.has(currentExtension);
};

const patchImports = (content) => {
  const rewrite = (_, prefix, specifier, suffix) => {
    if (!needsJsExtension(specifier)) {
      return `${prefix}${specifier}${suffix}`;
    }

    return `${prefix}${specifier}.js${suffix}`;
  };

  const importExportPattern = /((?:from|import)\s*['"])([^'"]+)(['"])/g;
  const dynamicImportPattern = /((?:import\s*\(\s*['"]))([^'"]+)(['"]\s*\))/g;

  return content.replace(importExportPattern, rewrite).replace(dynamicImportPattern, rewrite);
};

const walk = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.js')) {
      continue;
    }

    const original = await fs.readFile(fullPath, 'utf8');
    const updated = patchImports(original);

    if (updated !== original) {
      await fs.writeFile(fullPath, updated, 'utf8');
    }
  }
};

await walk(distDir.pathname);
