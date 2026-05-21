import { expect } from 'chai';
import fs from 'fs';
import { describe, it } from 'mocha';
import path from 'path';

describe('Publish feature contract between api and app', () => {
  const sortValues = (values: string[]) => [...values].sort((left, right) => left.localeCompare(right));

  const normalizeParents = (graph: Partial<Record<string, string[]>>) => {
    const entries = Object.entries(graph)
      .map(([featureType, parents]) => [featureType, sortValues(parents || [])] as const)
      .sort(([left], [right]) => left.localeCompare(right));

    return Object.fromEntries(entries);
  };

  const apiBiohubCreatePath = path.resolve(process.cwd(), 'src/models/biohub-create.ts');
  const appPublishFeatureTypesPath = path.resolve(
    process.cwd(),
    '../app/src/components/publish/publishFeatureTypes.ts'
  );
  const appFeatureDependenciesPath = path.resolve(
    process.cwd(),
    '../app/src/components/publish/featureDependencies.ts'
  );

  const apiBiohubCreateSource = fs.readFileSync(apiBiohubCreatePath, 'utf8');
  const appPublishFeatureTypesSource = fs.readFileSync(appPublishFeatureTypesPath, 'utf8');
  const appFeatureDependenciesSource = fs.readFileSync(appFeatureDependenciesPath, 'utf8');

  const extractBlockBody = (source: string, startToken: string): string => {
    const startIndex = source.indexOf(startToken);
    if (startIndex === -1) {
      throw new Error(`Unable to find token: ${startToken}`);
    }

    const braceStart = source.indexOf('{', startIndex);
    if (braceStart === -1) {
      throw new Error(`Unable to find opening brace for token: ${startToken}`);
    }

    let depth = 1;
    let index = braceStart + 1;
    while (index < source.length && depth > 0) {
      const char = source[index];
      if (char === '{') {
        depth += 1;
      } else if (char === '}') {
        depth -= 1;
      }
      index += 1;
    }

    if (depth !== 0) {
      throw new Error(`Unable to find matching closing brace for token: ${startToken}`);
    }

    return source.slice(braceStart + 1, index - 1);
  };

  const extractArrayBody = (source: string, startToken: string): string => {
    const startIndex = source.indexOf(startToken);
    if (startIndex === -1) {
      throw new Error(`Unable to find token: ${startToken}`);
    }

    const bracketStart = source.indexOf('[', startIndex);
    if (bracketStart === -1) {
      throw new Error(`Unable to find opening bracket for token: ${startToken}`);
    }

    let depth = 1;
    let index = bracketStart + 1;
    while (index < source.length && depth > 0) {
      const char = source[index];
      if (char === '[') {
        depth += 1;
      } else if (char === ']') {
        depth -= 1;
      }
      index += 1;
    }

    if (depth !== 0) {
      throw new Error(`Unable to find matching closing bracket for token: ${startToken}`);
    }

    return source.slice(bracketStart + 1, index - 1);
  };

  const parseBiohubEnum = (): Record<string, string> => {
    const enumBody = extractBlockBody(apiBiohubCreateSource, 'export enum BiohubFeatureType');
    const pairs = [...enumBody.matchAll(/([A-Z_]+)\s*=\s*'([^']+)'/g)];

    return Object.fromEntries(pairs.map(([, key, value]) => [key, value]));
  };

  const parseApiPublishableFeatures = (enumMap: Record<string, string>): string[] => {
    const arrayBody = extractArrayBody(apiBiohubCreateSource, 'export const PUBLISHABLE_FEATURE_TYPES =');
    const symbolMatches = [...arrayBody.matchAll(/BiohubFeatureType\.([A-Z_]+)/g)].map(([, symbol]) => symbol);

    return symbolMatches.map((symbol) => enumMap[symbol]).filter((value): value is string => Boolean(value));
  };

  const parseApiParents = (enumMap: Record<string, string>): Partial<Record<string, string[]>> => {
    const objectBody = extractBlockBody(apiBiohubCreateSource, 'export const PUBLISHABLE_FEATURE_TYPE_PARENTS');
    const entries = [...objectBody.matchAll(/\[BiohubFeatureType\.([A-Z_]+)\]\s*:\s*\[([^\]]*)\]/g)];

    const graph: Partial<Record<string, string[]>> = {};
    for (const [, childSymbol, parentsBody] of entries) {
      const parentSymbols = [...parentsBody.matchAll(/BiohubFeatureType\.([A-Z_]+)/g)].map(([, symbol]) => symbol);
      graph[enumMap[childSymbol]] = parentSymbols
        .map((parentSymbol) => enumMap[parentSymbol])
        .filter((value): value is string => Boolean(value));
    }

    return graph;
  };

  const parseFrontendFeatureTypes = (): Record<string, string> => {
    const objectBody = extractBlockBody(appPublishFeatureTypesSource, 'export const PUBLISH_FEATURE_TYPES =');
    const pairs = [...objectBody.matchAll(/([A-Z_]+)\s*:\s*'([^']+)'/g)];

    return Object.fromEntries(pairs.map(([, key, value]) => [key, value]));
  };

  const parseFrontendDependencyGraph = (
    source: string,
    token: string,
    frontendFeatureTypeMap: Record<string, string>
  ): Partial<Record<string, string[]>> => {
    const objectBody = extractBlockBody(source, token);
    const entries = [...objectBody.matchAll(/\[PUBLISH_FEATURE_TYPES\.([A-Z_]+)\]\s*:\s*\[([^\]]*)\]/g)];

    const graph: Partial<Record<string, string[]>> = {};
    for (const [, childSymbol, parentsBody] of entries) {
      const dependencySymbols = [...parentsBody.matchAll(/PUBLISH_FEATURE_TYPES\.([A-Z_]+)/g)].map(
        ([, symbol]) => symbol
      );
      graph[frontendFeatureTypeMap[childSymbol]] = dependencySymbols
        .map((dependencySymbol) => frontendFeatureTypeMap[dependencySymbol])
        .filter((value): value is string => Boolean(value));
    }

    return graph;
  };

  const apiEnumMap = parseBiohubEnum();
  const apiPublishableFeatures = parseApiPublishableFeatures(apiEnumMap);
  const apiParentGraph = parseApiParents(apiEnumMap);
  const frontendFeatureTypeMap = parseFrontendFeatureTypes();
  const frontendFeatures = Object.values(frontendFeatureTypeMap);
  const frontendParentGraph = parseFrontendDependencyGraph(
    appFeatureDependenciesSource,
    'export const PARENTS',
    frontendFeatureTypeMap
  );
  const frontendChildrenGraph = parseFrontendDependencyGraph(
    appFeatureDependenciesSource,
    'export const CHILDREN',
    frontendFeatureTypeMap
  );

  it('keeps publish feature values in sync', () => {
    expect(sortValues(frontendFeatures)).to.deep.equal(sortValues(apiPublishableFeatures));
  });

  it('keeps parent dependency graph in sync', () => {
    expect(normalizeParents(frontendParentGraph)).to.deep.equal(normalizeParents(apiParentGraph));
  });

  it('keeps CHILDREN graph as inverse of PARENTS', () => {
    for (const featureType of frontendFeatures) {
      const expectedChildren = Object.entries(frontendParentGraph)
        .filter(([, parentFeatureTypes]) => parentFeatureTypes?.includes(featureType))
        .map(([childFeatureType]) => childFeatureType);
      const actualChildren = frontendChildrenGraph[featureType] || [];

      expect(sortValues(actualChildren), `Children mismatch for ${featureType}`).to.deep.equal(
        sortValues(expectedChildren)
      );
    }
  });

  it('keeps backend parent graph values valid publishable features', () => {
    const publishableFeatures = new Set<string>(apiPublishableFeatures);

    for (const [featureType, parents] of Object.entries(apiParentGraph)) {
      expect(publishableFeatures.has(featureType), `${featureType} is not publishable`).to.equal(true);

      for (const parentFeatureType of parents || []) {
        expect(publishableFeatures.has(parentFeatureType), `${parentFeatureType} is not publishable`).to.equal(true);
      }
    }
  });
});
