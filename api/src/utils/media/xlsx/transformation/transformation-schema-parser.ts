import jsonpath from 'jsonpath';

export type FlattenSchema = {
  fileName: string;
  uniqueId: string[];
  parent?: { fileName: string; uniqueId: string[] };
};

export type FileTransformationFieldSchema = {
  columns?: string[];
  separator?: string;
  value?: any;
  unique?: string;
};

export type FileTransformationFieldsSchema = {
  [key: string]: FileTransformationFieldSchema;
};

export type TransformationSchema = {
  fileName: string;
  conditionalFields: string[];
  fields: FileTransformationFieldsSchema;
};

export type ParseSchema = {
  fileName: string;
  columns: string[];
  conditionalFields?: string[];
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

  getFlattenSchemas(fileName: string): FlattenSchema | null {
    return jsonpath.query(this.transformationSchema, this.getFlattenJsonPath(fileName))?.[0] || null;
  }

  getTransformationSchemas(): { fileTransformations: TransformationSchema[] }[] {
    return jsonpath.query(this.transformationSchema, this.getTransformationJsonPath())?.[0] || [];
  }

  getParseSchemas(): ParseSchema[] {
    return jsonpath.query(this.transformationSchema, this.getParseJsonPath())?.[0] || null;
  }

  getFlattenJsonPath(fileName: string): string {
    return `$.flatten[?(@.fileName == '${fileName}')]`;
  }

  getTransformationJsonPath(): string {
    return '$.transformations';
  }

  getParseJsonPath(): string {
    return '$.parse';
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
