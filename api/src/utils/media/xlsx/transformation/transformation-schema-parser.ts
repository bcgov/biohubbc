import jsonpath from 'jsonpath';

export type FlattenSchema = {
  fileName: string;
  uniqueId: string[];
  parent?: { fileName: string; uniqueId: string[] };
};

export type TransformationFieldSchema = {
  columns?: string[];
  separator?: string;
  value?: any;
  unique?: string;
  condition?: Condition;
};

export type TransformationFieldsSchema = {
  [key: string]: TransformationFieldSchema;
};

export type Condition = {
  if: {
    columns: string[];
  };
};

export type PostTransformationRelatopnshipSchema = {
  condition?: Condition;
  relationship: {
    spreadColumn: string;
    uniqueIdColumn: 'string';
  };
};

export type TransformSchema = {
  condition?: Condition;
  transformations: {
    condition?: Condition;
    fields: TransformationFieldsSchema;
  }[];
  postTransformations?: PostTransformationRelatopnshipSchema[];
};

export type ParseColumnSchema = { source: { columns?: string[]; value?: any }; target: string };

export type ParseSchema = {
  fileName: string;
  columns: ParseColumnSchema[];
  condition?: Condition;
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

  getAllFlattenSchemas(): FlattenSchema[] | [] {
    return jsonpath.query(this.transformationSchema, this.getFlattenJsonPath())?.[0] || [];
  }

  getFlattenSchemas(fileName: string): FlattenSchema | null {
    return jsonpath.query(this.transformationSchema, this.getFlattenJsonPathByFileName(fileName))?.[0] || null;
  }

  getTransformSchemas(): TransformSchema[] {
    return jsonpath.query(this.transformationSchema, this.getTransformationJsonPath())?.[0] || [];
  }

  getParseSchemas(): ParseSchema[] {
    return jsonpath.query(this.transformationSchema, this.getParseJsonPath())?.[0] || [];
  }

  getFlattenJsonPath(): string {
    return `$.flatten`;
  }

  getFlattenJsonPathByFileName(fileName: string): string {
    return `$.flatten[?(@.fileName == '${fileName}')]`;
  }

  getTransformationJsonPath(): string {
    return '$.transform';
  }

  getParseJsonPath(): string {
    return '$.parse';
  }

  parseJson(json: any): object {
    let parsedJson;

    try {
      parsedJson = JSON.parse(json);
    } catch {
      throw Error('TransformationSchemaParser - provided validationSchema was not valid JSON');
    }

    return parsedJson;
  }
}
