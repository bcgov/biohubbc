import jsonpath from 'jsonpath';
import { XLSXCSVTransformer } from '../xlsx-file';
import { getBasicTransformer } from './csv-file-transformer';

export const TransformationRulesRegistry = {
  registry: [
    {
      name: 'basic_transformer',
      generator: getBasicTransformer
    }
  ],
  findMatchingRule(name: string): any {
    return this.registry.find((item) => item.name === name)?.generator;
  }
};

export type FileStructure = {
  name: string;
  uniqueId: string[];
  parent?: { name: string; key: string[] };
};

export class TransformationSchemaParser {
  transformationSchema: object;

  constructor(transformationSchema: string | object) {
    if (typeof transformationSchema === 'string') {
      this.transformationSchema = this.parseJson(transformationSchema);
    } else {
      this.transformationSchema = transformationSchema;
    }
  }

  getFileTransformations(fileName: string): XLSXCSVTransformer[] {
    const transformationSchemas = this.getFileTransformationSchemas(fileName);

    const rules: XLSXCSVTransformer[] = [];

    transformationSchemas.forEach((transformationSchema) => {
      const keys = Object.keys(transformationSchema);

      if (keys.length !== 1) {
        return;
      }

      const key = keys[0];

      const generatorFunction = TransformationRulesRegistry.findMatchingRule(key);

      if (!generatorFunction) {
        return;
      }

      const rule = generatorFunction(transformationSchema);

      rules.push(rule);
    });

    return rules;
  }

  getFileTransformationSchemas(fileName: string): object[] {
    return jsonpath.query(this.transformationSchema, this.getFileTransformationsJsonPath(fileName))?.[0] || [];
  }

  getTransformationSchemas(): object[] {
    return jsonpath.query(this.transformationSchema, this.getTransformationsJsonPath())?.[0] || [];
  }

  getFileStructureSchemas(fileName: string): FileStructure | null {
    return jsonpath.query(this.transformationSchema, this.getFileStructureJsonPath(fileName))?.[0] || null;
  }

  getParseSchemas(): { file: string; columns: string[] }[] {
    return jsonpath.query(this.transformationSchema, this.getParseJsonPath())?.[0] || null;
  }

  getFileTransformationsJsonPath(fileName: string): string {
    return `$.files[?(@.name == '${fileName}')].transformations`;
  }

  getTransformationsJsonPath(): string {
    return '$.transformations';
  }

  getParseJsonPath(): string {
    return '$.parse';
  }

  getFileStructureJsonPath(fileName: string): string {
    return `$.flatten[?(@.name == '${fileName}')]`;
  }

  parseJson(json: any): object {
    let parsedJson;

    try {
      parsedJson = JSON.parse(json);
    } catch {
      throw Error('TransformationSchemaParser - provided validatioNSchema was not valid JSON');
    }

    return parsedJson;
  }
}
