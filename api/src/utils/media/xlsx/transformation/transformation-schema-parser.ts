import jsonpath from 'jsonpath';
import { XLSXCSVTransformer } from '../xlsx-file';
import { getBasicTransformer } from './csv-header-transformer';

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

export class TransformationSchemaParser {
  transformationSchema: object;

  constructor(transformationSchema: string | object) {
    if (typeof transformationSchema === 'string') {
      this.transformationSchema = this.parseJson(transformationSchema);
    } else {
      this.transformationSchema = transformationSchema;
    }
  }

  getTransformations(): XLSXCSVTransformer[] {
    const transformationSchemas = this.getTransformationSchemas();

    const rules: XLSXCSVTransformer[] = [];

    transformationSchemas.forEach((validationSchema) => {
      const keys = Object.keys(validationSchema);

      if (keys.length !== 1) {
        return;
      }

      const key = keys[0];

      const generatorFunction = TransformationRulesRegistry.findMatchingRule(key);

      if (!generatorFunction) {
        return;
      }

      const rule = generatorFunction(validationSchema);

      rules.push(rule);
    });

    return rules;
  }

  getTransformationSchemas(): object[] {
    return jsonpath.query(this.transformationSchema, this.getTransformationsJsonPath())?.[0] || [];
  }

  getTransformationsJsonPath(): string {
    return '$.transformations';
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
