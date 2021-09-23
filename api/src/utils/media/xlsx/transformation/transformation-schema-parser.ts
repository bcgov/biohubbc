import jsonpath from 'jsonpath';

export type FileStructure = {
  name: string;
  uniqueId: string[];
  parent?: { name: string; key: string[] };
};

export type FileTransformationSchema = {
  fileName: string;
  condition: string[];
  fields: { [key: string]: { columns?: string[]; separator?: string; value?: any; unique?: string } };
};

export type ParseSchema = {
  file: string;
  columns: string[];
  condition?: string[];
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

  getFileTransformationSchemas(fileName: string): object[] {
    return jsonpath.query(this.transformationSchema, this.getFileTransformationsJsonPath(fileName))?.[0] || [];
  }

  getTransformationSchemas(): { fileTransformations: FileTransformationSchema[] }[] {
    return jsonpath.query(this.transformationSchema, this.getTransformationsJsonPath())?.[0] || [];
  }

  getFileStructureSchemas(fileName: string): FileStructure | null {
    return jsonpath.query(this.transformationSchema, this.getFileStructureJsonPath(fileName))?.[0] || null;
  }

  getParseSchemas(): ParseSchema[] {
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
