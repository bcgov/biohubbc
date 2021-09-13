import jsonpath from 'jsonpath';

const TransformationRulesRegistry = {
  registry: [
    {
      name: '',
      generator: null
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

  getTransformations(): Transformer[] {
    const rules: Transformer[] = [];

    return rules;
  }

  getSubmissionTransformationSChemas(): object[] {
    return jsonpath.query(this.transformationSchema, this.getSubmissionTransformationsJsonPath())?.[0] || [];
  }

  getSubmissionTransformationsJsonPath(): string {
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
