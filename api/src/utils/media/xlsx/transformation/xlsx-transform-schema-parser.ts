import { JSONPath } from 'jsonpath-plus';

export type TemplateSheetName = string;
export type TemplateColumnName = string;

export type DWCSheetName = string;
export type DWCColumnName = string;

export type JSONPathString = string;
export type ConditionSchema = {
  type: 'and' | 'or';
  /**
   * One or more checks.
   *
   * @type {IfNotEmptyCheck[]}
   */
  checks: IfNotEmptyCheck[];
  /**
   * Logically `not` the result of the condition.
   *
   * @type {boolean}
   */
  not?: boolean;
};

export type IfNotEmptyCheck = {
  /**
   * `true` if the `JSONPathString` value, when processed, results in a non-empty non-null value.
   *
   * @type {JSONPathString}
   */
  ifNotEmpty: JSONPathString;
  /**
   * Logically `not` the result of this check.
   *
   * @type {boolean}
   */
  not?: boolean;
};

export type TemplateMetaForeignKeySchema = {
  sheetName: string;
  primaryKey: string[];
};

/**
 * - `root`: indicates the node is the top level root node (only 1 node can be type `root`).
 * - `leaf`: indicates the node is a leaf node. A node that is type `leaf` will prevent the hierarchical
 * parsing from progressing further, into this nodes children (if any).
 * - `<empty>`: indicates a regular node, with no particular special considerations.
 */
export type TemplateMetaSchemaType = 'root' | 'leaf' | '';

export type TemplateMetaSchema = {
  /**
   * The name of the template sheet.
   *
   * @type {string}
   */
  sheetName: TemplateSheetName;
  /**
   * An array of json path query strings.
   *
   * @type {string[]}
   */
  primaryKey: string[];
  /**
   * An array of json path query strings.
   *
   * @type {string[]}
   */
  parentKey: string[];
  /**
   * The type of the node.
   *
   * @type {TemplateMetaSchemaType}
   */
  type: TemplateMetaSchemaType;
  /**
   * An array of linked child nodes.
   *
   * @type {TemplateMetaForeignKeySchema[]}
   */
  foreignKeys: TemplateMetaForeignKeySchema[];
};

export type MapColumnValuePostfixSchema = {
  /**
   * An array of json path query strings.
   *
   * If multiple query strings are provided, they will be fetched in order, and the first one that returns a non-empty
   * value will be used.
   *
   * A single JSON path string may return one value, or an array of values.
   *
   * @see {@link RowObject} for special known fields that may be used in these `JSONPathString` values.
   * @type {JSONPathString[]}
   */
  paths?: JSONPathString[];
  /**
   * A static value to append to the end of the final `paths` value.
   *
   * Note:
   * - `unique` - If `static` is set to the string `unique`, at transformation time this will be replaced with a unique
   * number. This number will be distinct from all other `unique` values, but not necessarily unique from other values
   * in the transformed data (it is not a guid).
   *
   * If `static` is set in addition to `paths`, the `paths` will be ignored.
   *
   * @type {(string | 'unique')}
   */
  static?: string | 'unique';
};

export type MapColumnValueSchema = {
  /**
   * An array of json path strings.
   *
   * If multiple JSON path strings are provided, they will be fetched in order, and the first one that returns a
   * non-empty value will be used.
   *
   * A single JSON path string may return one value, or an array of values.
   *
   * If an array of values is returned, they will be joined using the specified `join` string.
   * If `join` string is not specified, a colon `:` will be used as the default `join` string.
   *
   * @see {@link RowObject} for special known fields that may be used in these `JSONPathString` values.
   * @type {JSONPathString[]}
   */
  paths?: JSONPathString[];
  /**
   * A static value to be used, in place of any `paths`.
   *
   * If `static` is set in addition to `paths`, the `paths` will be ignored.
   *
   * @type {string}
   */
  static?: string;
  /**
   * A string used to join multiple path values (if the `paths` query string returns multiple values that need joining).
   *
   * Defaults to a colon `:` if not provided.
   *
   * @type {string}
   */
  join?: string;
  /**
   * A value to append to the end of the final `paths` value.
   *
   * Will be joined using the `join` value.
   *
   * @type {MapColumnValuePostfixSchema}
   */
  postfix?: MapColumnValuePostfixSchema;
  /**
   * A condition, which contains one or more checks that must be met in order to proceed processing the schema element.
   *
   * @type {ConditionSchema}
   */
  condition?: ConditionSchema;
  /**
   * An array of additional Schemas to add to process. Used to create additional records.
   *
   * @type {MapSchema[]}
   */
  add?: MapSchema[];
};

export type MapFieldSchema = {
  /**
   * The name of the DWC column (term).
   *
   * @type {DWCColumnName}
   */
  columnName: DWCColumnName;
  /**
   * The schema that defines how the value of the column is produced.
   *
   * If multiple values are provided, the first one that passes all conditions (if any) and returns a non-empty path
   * result will be used. and the remaining values will be skipped.
   *
   * @type {MapColumnValueSchema[]}
   */
  columnValue: MapColumnValueSchema[];
};

export type MapSchema = {
  /**
   * The name of the DWC sheet.
   *
   * @type {DWCSheetName}
   */
  sheetName: DWCSheetName;
  /**
   * A condition, which contains one or more checks that must be met in order to proceed processing the schema element.
   *
   * @type {ConditionSchema}
   */
  condition?: ConditionSchema;
  /**
   * An array of additional Schemas to add to process. Used to create additional records.
   *
   * @type {MapSchema[]}
   */
  add?: MapSchema[];
  /**
   * The schema tht defines all of the columns the be produced under this sheet.
   *
   * @type {MapFieldSchema[]}
   */
  fields: MapFieldSchema[];
};

export type DwcSchema = {
  sheetName: string;
  primaryKey: string[];
};

export type TransformSchema = {
  /**
   * Defines the structure of the template, and any other relevant meta.
   *
   * The template, and the corresponding templateMeta definition, must correspond to a valid tree structure, with no loops.
   *
   * @type {TemplateMetaSchema[]}
   */
  templateMeta: TemplateMetaSchema[];
  /**
   * Defines the mapping from parsed raw template data to DarwinCore (DWC) templateMeta.
   *
   * @type {MapSchema[]}
   */
  map: MapSchema[];
  /**
   * Defines DWC specific meta needed by various steps of the transformation.
   *
   * @type {DwcSchema[]}
   */
  dwcMeta: DwcSchema[];
};

export type PreparedTransformSchema = TransformSchema & {
  templateMeta: (TemplateMetaSchema & { distanceToRoot: number })[];
};

/**
 * Wraps a raw template transform config, modifying the config in preparation for use by the transformation engine, and
 * providing additional helper functions for retrieving information from the config.
 *
 * @class XLSXTransformSchemaParser
 */
class XLSXTransformSchemaParser {
  preparedTransformSchema: PreparedTransformSchema = {
    templateMeta: [],
    map: [],
    dwcMeta: []
  };

  /**
   * Creates an instance of XLSXTransformSchemaParser.
   *
   * @param {TransformSchema} transformSchema
   * @memberof XLSXTransformSchemaParser
   */
  constructor(transformSchema: TransformSchema) {
    this._processRawTransformSchema(transformSchema);
  }

  /**
   * Process the original transform schema, building a modified version that contains additional generated data used by
   * the transform process.
   *
   * @param {TransformSchema} transformSchema
   * @memberof XLSXTransformSchemaParser
   */
  _processRawTransformSchema(transformSchema: TransformSchema) {
    // prepare the `templateMeta` portion of the original transform schema
    this.preparedTransformSchema.templateMeta = this._processTemplateMeta(transformSchema.templateMeta);
    this.preparedTransformSchema.map = transformSchema.map;
    this.preparedTransformSchema.dwcMeta = transformSchema.dwcMeta;
  }

  /**
   * Prepare the `templateMeta` portion of the transform schema.
   *
   * Recurse through the 'templateMeta' portion of the transform schema and build a modified version which has all items
   * arranged in processing order (example: the root element is at index=0 in the array, etc) and where each item
   * includes a new value `distanceToRoot` which indicates which tier of the tree that item is at (example: the root
   * element is at `distanceToRoot=0`, its direct children are at `distanceToRoot=1`, etc)
   *
   * Note: This step could in be removed if the order of the transform schema was assumed to be correct by default and
   * the `distanceToRoot` field was added to the type as a required field, and assumed to be set correctly.
   *
   * @param {TransformSchema['templateMeta']} templateMeta
   * @return {*}  {PreparedTransformSchema['templateMeta']}
   * @memberof XLSXTransformSchemaParser
   */
  _processTemplateMeta(templateMeta: TransformSchema['templateMeta']): PreparedTransformSchema['templateMeta'] {
    const preparedTemplateMeta = [];

    const rootSheetSchema = Object.values(templateMeta).find((sheet) => sheet.type === 'root');

    if (!rootSheetSchema) {
      throw Error('No root template meta schema was defined');
    }

    preparedTemplateMeta.push({ ...rootSheetSchema, distanceToRoot: 0 });

    const loop = (sheetNames: string[], distanceToRoot: number) => {
      let nextSheetNames: string[] = [];

      sheetNames.forEach((sheetName) => {
        const sheetSchema = Object.values(templateMeta).find((sheet) => sheet.sheetName === sheetName);

        if (!sheetSchema) {
          return;
        }

        preparedTemplateMeta.push({ ...sheetSchema, distanceToRoot: distanceToRoot });

        nextSheetNames = nextSheetNames.concat(sheetSchema.foreignKeys.map((item) => item.sheetName));
      });

      if (!nextSheetNames.length) {
        return;
      }

      loop(nextSheetNames, distanceToRoot + 1);
    };

    loop(
      rootSheetSchema.foreignKeys.map((item) => item.sheetName),
      1
    );

    return preparedTemplateMeta;
  }

  /**
   * Find and return the template meta config for a template sheet.
   *
   * Note: parses the `templateMeta` portion of the transform config.
   *
   * @param {string} sheetName
   * @return {*}  {(TemplateMetaSchema | undefined)}
   * @memberof XLSXTransformSchemaParser
   */
  getTemplateMetaConfigBySheetName(sheetName: string): TemplateMetaSchema | undefined {
    return Object.values(this.preparedTransformSchema.templateMeta).find((sheet) => sheet.sheetName === sheetName);
  }

  /**
   * Get a list of all unique DWC sheet names.
   *
   * Note: parses the `map` portion of the transform config.
   *
   * @return {*}  {string[]}
   * @memberof XLSXTransformSchemaParser
   */
  getDWCSheetNames(): string[] {
    const names = JSONPath<string[]>({ path: '$.[sheetName]', json: this.preparedTransformSchema.map });

    return Array.from(new Set(names));
  }

  /**
   * Find and return the dwc sheet keys for a DWC sheet.
   *
   * Note: parses the `dwcMeta` portion of the transform config.
   *
   * @param {string} sheetName
   * @return {*}  {string[]}
   * @memberof XLSXTransformSchemaParser
   */
  getDWCSheetKeyBySheetName(sheetName: string): string[] {
    const result = JSONPath<string[][]>({
      path: `$..[?(@.sheetName === '${sheetName}' )][primaryKey]`,
      json: this.preparedTransformSchema.dwcMeta
    });

    return result[0];
  }
}

export default XLSXTransformSchemaParser;
