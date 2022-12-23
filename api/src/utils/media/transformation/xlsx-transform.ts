import jsonpatch, { Operation } from 'fast-json-patch';
import * as fs from 'fs';
import { JSONPath, JSONPathOptions } from 'jsonpath-plus';
import path from 'path';
import xlsx from 'xlsx';
import XLSXTransformSchemaParser, {
  ConditionSchema,
  DWCColumnName,
  DWCSheetName,
  IfNotEmptyCheck,
  JSONPathString,
  TemplateColumnName,
  TemplateMetaSchema,
  TemplateSheetName,
  TransformSchema
} from './xlsx-transform-schema-parser';
import { filterDuplicateKeys, getCombinations } from './xlsx-transform-utils';
import { getWorksheetByName, getWorksheetRange, trimWorksheetCells } from './xlsx-utils';

/**
 * Defines a type that indicates a `Partial` value, but with some exceptions.
 *
 * @example
 * type MyType = {
 *   val1: string,  // required
 *   val2: number,  // required
 *   val3: boolean  // required
 * }
 *
 * Partial<MyType> = {
 *   val1?: string,  // optional
 *   val2?: number,  // optional
 *   val3?: noolean, // optional
 * }
 *
 * AtLeast<MyType, 'val1' | 'val2'> = {
 *   val1: string,  // required
 *   val2: number,  // required
 *   val3?: boolean // optional
 * }
 */
type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type NonObjectPrimitive = string | number | null | boolean;

export type RowObject = {
  _data: { [key: string]: NonObjectPrimitive };
  _name: string;
  _key: string;
  _parentKey: string | '';
  _type: 'root' | 'leaf' | '';
  _row: number;
  _childKeys: string[];
  _children: RowObject[];
};

export class XLSXTransform {
  workbook: xlsx.WorkBook;
  schemaParser: XLSXTransformSchemaParser;

  _uniqueIncrement = 0;

  constructor(workbook: xlsx.WorkBook, schema: TransformSchema) {
    this.workbook = workbook;
    this.schemaParser = new XLSXTransformSchemaParser(schema);
  }

  /**
   * Run the transformation process.
   *
   * @memberof XLSXTransform
   */
  start() {
    // Prepare the raw data, by adding keys and other dwcMeta to the raw row objects
    const preparedRowObjects = this.prepareRowObjects();
    fs.writeFileSync(path.join(__dirname, 'output', '1.json'), JSON.stringify(preparedRowObjects, null, 2));

    // Recurse through the data, and create a hierarchical structure for each logical record
    const hierarchicalRowObjects = this.buildRowObjectsHierarchy(preparedRowObjects);
    fs.writeFileSync(path.join(__dirname, 'output', '2.json'), JSON.stringify(hierarchicalRowObjects, null, 2));

    // Iterate over the hierarchical row objects, mapping original values to their DWC equivalents
    const processedHierarchicalRowObjects = this.processHierarchicalRowObjects(hierarchicalRowObjects);
    fs.writeFileSync(
      path.join(__dirname, 'output', '3.json'),
      JSON.stringify(processedHierarchicalRowObjects, null, 2)
    );

    // Iterate over the Darwin Core records, group them by DWC sheet name, and remove duplicate records in each sheet
    const preparedRowObjectsForJSONToSheet = this.prepareRowObjectsForJSONToSheet(processedHierarchicalRowObjects);
    fs.writeFileSync(
      path.join(__dirname, 'output', '4.json'),
      JSON.stringify(preparedRowObjectsForJSONToSheet, null, 2)
    );

    return preparedRowObjectsForJSONToSheet;
  }

  /**
   * Modifies the raw row objects returned by xlsx, and adds additional data (row numbers, keys, etc) that will be used
   * in later steps of the transformation process.
   *
   * @return {*}  {Record<TemplateSheetName, RowObject[]>}
   * @memberof XLSXTransform
   */
  prepareRowObjects(): Record<TemplateSheetName, RowObject[]> {
    const output: Record<TemplateSheetName, RowObject[]> = {};

    this.workbook.SheetNames.forEach((sheetName) => {
      const templateMetaSchema = this.schemaParser.getTemplateMetaConfigBySheetName(sheetName);

      if (!templateMetaSchema) {
        // Skip worksheet as no transform schema was provided
        return;
      }

      const worksheet = getWorksheetByName(this.workbook, sheetName);

      // Trim all whitespace on string values
      trimWorksheetCells(worksheet);

      const range = getWorksheetRange(worksheet);

      if (!range) {
        throw Error('Worksheet range is undefined');
      }

      const worksheetJSON = xlsx.utils.sheet_to_json<Record<TemplateColumnName, any>>(worksheet, {
        blankrows: false,
        raw: true,
        rawNumbers: false
      });

      const numberOfRows = range['e']['r'];

      const preparedRowObjects = this._prepareRowObjects(worksheetJSON, templateMetaSchema, numberOfRows);

      output[sheetName] = preparedRowObjects;
    });

    return output;
  }

  _prepareRowObjects(
    worksheetJSON: Record<TemplateColumnName, any>[],
    templateMetaSchema: TemplateMetaSchema,
    numberOfRows: number
  ): RowObject[] {
    const worksheetJSONWithKey: RowObject[] = [];

    for (let i = 0; i < numberOfRows; i++) {
      const primaryKey = this._getKeyForRowObject(worksheetJSON[i], templateMetaSchema.primaryKey);

      if (!primaryKey) {
        continue;
      }

      const parentKey = this._getKeyForRowObject(worksheetJSON[i], templateMetaSchema.parentKey);

      const childKeys = templateMetaSchema.foreignKeys
        .map((foreignKeys: { sheetName: TemplateColumnName; primaryKey: string[] }) => {
          return this._getKeyForRowObject(worksheetJSON[i], foreignKeys.primaryKey);
        })
        .filter((item): item is string => !!item);

      worksheetJSONWithKey.push({
        _data: { ...worksheetJSON[i] },
        _name: templateMetaSchema.sheetName,
        _key: primaryKey,
        _parentKey: parentKey,
        _type: templateMetaSchema.type,
        _row: i,
        _childKeys: childKeys || [],
        _children: []
      });
    }

    return worksheetJSONWithKey;
  }

  _getKeyForRowObject(RowObject: Record<TemplateColumnName, any>, keyColumnNames: string[]): string {
    if (!keyColumnNames.length) {
      return '';
    }

    if (!RowObject || Object.getPrototypeOf(RowObject) !== Object.prototype || Object.keys(RowObject).length === 0) {
      return '';
    }

    const primaryKey: string = keyColumnNames
      .map((columnName: string) => {
        return RowObject[columnName];
      })
      .filter((value) => !isNaN || value)
      .join(':');

    return primaryKey;
  }

  /**
   * De-normalize the original template data into a nested hierarchical object structure, based on the `templateMeta`
   * portion of the transform config.
   *
   * @param {Record<TemplateSheetName, RowObject[]>} preparedRowObjects
   * @return {*}  {{ _children: RowObject[] }}
   * @memberof XLSXTransform
   */
  buildRowObjectsHierarchy(preparedRowObjects: Record<TemplateSheetName, RowObject[]>): { _children: RowObject[] } {
    const hierarchicalRowObjects: { _children: RowObject[] } = { _children: [] };

    for (let queueIndex = 0; queueIndex < this.schemaParser.preparedTransformSchema.templateMeta.length; queueIndex++) {
      const transformQueueItem = this.schemaParser.preparedTransformSchema.templateMeta[queueIndex];

      const sheetName = transformQueueItem.sheetName;

      const rowObjects = preparedRowObjects[sheetName];

      if (!rowObjects) {
        // No row objects for sheet
        continue;
      }

      const distanceToRoot = transformQueueItem.distanceToRoot;

      if (distanceToRoot === 0) {
        // These are root row objects, and can be added to the `hierarchicalRowObjects` array directly as they have no
        // parent to be nested under
        hierarchicalRowObjects._children = rowObjects;

        continue;
      }

      // Add non-root row objects
      for (let rowIndex = 0; rowIndex < rowObjects.length; rowIndex++) {
        const rowObjectsItem = rowObjects[rowIndex];

        const pathsToPatch: string[] = JSONPath({
          json: hierarchicalRowObjects,
          path: `$${'._children[*]'.repeat(distanceToRoot - 1)}._children[?(@._childKeys.indexOf("${
            rowObjectsItem._parentKey
          }") != -1)]`,
          resultType: 'pointer'
        });

        if (pathsToPatch.length === 0) {
          // Found no parent row object, even though this row object is a non-root row object
          // This could indicate a possible error in the transform schema or the raw data
          continue;
        }

        const patchOperations: Operation[] = pathsToPatch.map((pathToPatch) => {
          return { op: 'add', path: `${pathToPatch}/_children/`, value: rowObjectsItem };
        });

        jsonpatch.applyPatch(hierarchicalRowObjects, patchOperations);
      }
    }

    return hierarchicalRowObjects;
  }

  /**
   * Map the original template data to their corresponding DWC terms, based on the operations in the `map` portion
   * of the transform config.
   *
   * @param {{
   *     _children: RowObject[];
   *   }} hierarchicalRowObjects
   * @return {*}  {Record<DWCSheetName, Record<DWCColumnName, string>[]>[]}
   * @memberof XLSXTransform
   */
  processHierarchicalRowObjects(hierarchicalRowObjects: {
    _children: RowObject[];
  }): Record<DWCSheetName, Record<DWCColumnName, string>[]>[] {
    const mapRowObjects: Record<DWCSheetName, Record<DWCColumnName, string>[]>[] = [];

    // For each hierarchicalRowObjects
    for (let rowIndex = 0; rowIndex < hierarchicalRowObjects._children.length; rowIndex++) {
      const hierarchicalRowObject = hierarchicalRowObjects._children[rowIndex];

      const flattenedRowObjects = this._flattenHierarchicalRowObject(hierarchicalRowObject);

      for (let flatIndex = 0; flatIndex < flattenedRowObjects.length; flatIndex++) {
        const flattenedRowObject = flattenedRowObjects[flatIndex] as RowObject[];

        const result = this._mapFlattenedRowObject(flattenedRowObject);

        mapRowObjects.push(result);
      }
    }

    return mapRowObjects;
  }

  _flattenHierarchicalRowObject(hierarchicalRowObject: RowObject) {
    const flattenedRowObjects: AtLeast<RowObject, '_children'>[][] = [
      // Wrap the root element in `_children` so that the looping logic doesn't have to distinguish between the root
      // element and subsequent children elements, it can just always grab the `_children`, of which the first one
      // just so happens to only contain the root element.
      [{ _children: [{ ...hierarchicalRowObject }] }]
    ];

    const prepGetCombinations = (source: AtLeast<RowObject, '_children'>[]): Record<TemplateSheetName, RowObject[]> => {
      const prepGetCombinations: Record<TemplateSheetName, RowObject[]> = {};

      for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex++) {
        if (source[sourceIndex]._type === 'leaf') {
          // This node is marked as a leaf, so do not descend into its children.
          continue;
        }

        const children = source[sourceIndex]._children;

        for (let childrenIndex = 0; childrenIndex < children.length; childrenIndex++) {
          const child = children[childrenIndex];

          if (!prepGetCombinations[child._name]) {
            prepGetCombinations[child._name] = [];
          }

          prepGetCombinations[child._name].push(child);
        }
      }

      return prepGetCombinations;
    };

    const loop = (flatIndex: number, source: AtLeast<RowObject, '_children'>[]) => {
      // Grab all of the children of the current `source` and build an object in the format needed by the `getCombinations`
      // function.
      const preppedForGetCombinations = prepGetCombinations(source);

      // Loop over the prepped records, and build an array of objects which contain all of the possible combinations
      // of the records. See function for more details.
      const combinations = getCombinations(preppedForGetCombinations);

      if (combinations.length === 0) {
        // No combinations elements, which means there were no children to process, indicating we've reached the end of
        // the tree
        return;
      }

      if (combinations.length > 1) {
        // This for loop is intentionally looping backwards, and stopping 1 element short of the 0'th element.
        // This is because we only want to process the additional elements, pushing them onto the array, and leaving
        // the code further below to handle the 0'th element, which will be set at the current `flatIndex`
        for (let getCombinationsIndex = combinations.length - 1; getCombinationsIndex > 0; getCombinationsIndex--) {
          let newSource: AtLeast<RowObject, '_children'>[] = [];
          for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex++) {
            if (Object.keys(source[sourceIndex]).length <= 1) {
              continue;
            }
            newSource.push({ ...source[sourceIndex], _children: [] });
          }
          newSource = newSource.concat(Object.values(combinations[getCombinationsIndex]));
          flattenedRowObjects.push(newSource);
        }
      }

      // Handle the 0'th element of `combinations`, setting the `newSource` at whatever the current `flatIndex` is
      let newSource: AtLeast<RowObject, '_children'>[] = [];
      for (let sourceIndex = 0; sourceIndex < source.length; sourceIndex++) {
        if (Object.keys(source[sourceIndex]).length <= 1) {
          continue;
        }
        newSource.push({ ...source[sourceIndex], _children: [] });
      }
      newSource = newSource.concat(Object.values(combinations[0]));
      flattenedRowObjects[flatIndex] = newSource;

      // Recurse into the newSource
      loop(flatIndex, newSource);
    };

    // For each element in `flattenedRowObjects`, recursively descend through its children, flattening them as we
    // go. If 2 children are of the same type, then push a copy of the current `flattenedRowObjects` element onto
    // the `flattenedRowObjects` array, which will be processed on the next iteration of the for loop.
    for (let index = 0; index < flattenedRowObjects.length; index++) {
      loop(index, flattenedRowObjects[index]);
    }

    return flattenedRowObjects;
  }

  _mapFlattenedRowObject(flattenedRow: RowObject[]) {
    const output: Record<DWCSheetName, Record<DWCColumnName, string>[]> = {};

    const indexBySheetName: Record<TemplateSheetName, number> = {};

    const mapSchema = [...this.schemaParser.preparedTransformSchema.map];

    // For each sheet
    for (let mapIndex = 0; mapIndex < mapSchema.length; mapIndex++) {
      // Check conditions, if any
      const sheetCondition = mapSchema[mapIndex].condition;
      if (sheetCondition) {
        if (!this._processCondition(sheetCondition, flattenedRow)) {
          // Conditions not met, skip processing this item
          continue;
        }
      }

      const sheetName = mapSchema[mapIndex].sheetName;

      if (!output[sheetName]) {
        output[sheetName] = [];
        indexBySheetName[sheetName] = 0;
      } else {
        indexBySheetName[sheetName] = indexBySheetName[sheetName] + 1;
      }

      const fields = mapSchema[mapIndex].fields;

      if (fields && fields.length) {
        // For each item in the `fields` array
        for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
          // The final computed cell value for this particular schema field element
          let cellValue = '';

          const columnName = fields[fieldIndex].columnName;
          const columnValue = fields[fieldIndex].columnValue;

          // For each item in the `columnValue` array
          for (let columnValueIndex = 0; columnValueIndex < columnValue.length; columnValueIndex++) {
            const columnValueItem = columnValue[columnValueIndex];

            // Check conditions, if any
            const columnValueItemCondition = columnValueItem.condition;
            if (columnValueItemCondition) {
              if (!this._processCondition(columnValueItemCondition, flattenedRow)) {
                // Conditions not met, skip processing this item
                continue;
              }
            }

            // Check for static value
            const columnValueItemValue = columnValueItem.static;
            if (columnValueItemValue) {
              // cell value is a static value
              cellValue = columnValueItemValue;
            }

            // Check for path value(s)
            const columnValueItemPaths = columnValueItem.paths;
            if (columnValueItemPaths) {
              const pathValues = this._processPaths(columnValueItemPaths, flattenedRow);

              let pathValue = '';
              if (Array.isArray(pathValues)) {
                // cell value is the concatenation of multiple values
                pathValue = (pathValues.length && pathValues.flat(Infinity).join(columnValueItem.join || ':')) || '';
              } else {
                // cell value is a single value
                pathValue = pathValues || '';
              }

              cellValue = pathValue;

              // Add the optional postfix
              const columnValueItemPostfix = columnValueItem.postfix;
              if (cellValue && columnValueItemPostfix) {
                let postfixValue = '';

                if (columnValueItemPostfix.static) {
                  postfixValue = columnValueItemPostfix.static;

                  if (columnValueItemPostfix.static === 'unique') {
                    postfixValue = String(this._getNextUniqueNumber());
                  }
                }

                if (columnValueItemPostfix.paths) {
                  const postfixPathValues = this._processPaths(columnValueItemPostfix.paths, flattenedRow);

                  if (Array.isArray(postfixPathValues)) {
                    // postfix value is the concatenation of multiple values
                    postfixValue =
                      (postfixPathValues.length && postfixPathValues.join(columnValueItem.join || ':')) || '';
                  } else {
                    // postfix value is a single value
                    postfixValue = postfixPathValues || '';
                  }
                }

                cellValue = `${cellValue}${columnValueItem.join || ':'}${postfixValue}`;
              }
            }

            // Check for `add` additions at the field level
            const columnValueItemAdd = columnValueItem.add;
            if (columnValueItemAdd && columnValueItemAdd.length) {
              for (let addIndex = 0; addIndex < columnValueItemAdd.length; addIndex++) {
                mapSchema.push(columnValueItemAdd[addIndex]);
              }
            }

            if (cellValue) {
              // One of the columnValue array items yielded a non-empty cell value, skip any remaining columnValue items.
              break;
            }
          }

          // add the cell key value
          output[sheetName][indexBySheetName[sheetName]] = {
            ...output[sheetName][indexBySheetName[sheetName]],
            [columnName]: cellValue
          };
        }
      }

      // Check for additions at the sheet level
      const sheetAdds = mapSchema[mapIndex].add;
      if (sheetAdds && sheetAdds.length) {
        for (let addIndex = 0; addIndex < sheetAdds.length; addIndex++) {
          mapSchema.push(sheetAdds[addIndex]);
        }
      }
    }

    return output;
  }

  /**
   * Process a transform config `condition`, returning `true` if the condition passed and `false` otherwise.
   *
   * @param {ConditionSchema} condition
   * @param {RowObject[]} rowObjects
   * @return {*}  {boolean} `true` if the condition passed, `false` otherwise
   * @memberof XLSXTransform
   */
  _processCondition(condition: ConditionSchema, rowObjects: RowObject[]): boolean {
    if (!condition) {
      // No conditions to process
      return true;
    }

    const conditionsMet = new Set<boolean>();

    for (let checksIndex = 0; checksIndex < condition.checks.length; checksIndex++) {
      const check = condition.checks[checksIndex];

      if (check.ifNotEmpty) {
        conditionsMet.add(this._processIfNotEmptyCondition(check, rowObjects));
      }
    }

    if (condition.type === 'or') {
      return conditionsMet.has(true);
    }

    return !conditionsMet.has(false);
  }

  _processIfNotEmptyCondition(check: IfNotEmptyCheck, rowObjects: RowObject[]): boolean {
    const pathValues = this._processPaths([check.ifNotEmpty], rowObjects);

    if (!pathValues || !pathValues.length) {
      // condition failed
      return false;
    }

    return true;
  }

  _processPaths(paths: JSONPathString[], json: JSONPathOptions['json']): string | string[] | string[][] {
    if (paths.length === 0) {
      return '';
    }

    if (paths.length === 1) {
      return JSONPath({ path: paths[0], json: json }) || '';
    }

    const values = [];

    for (let pathsIndex = 0; pathsIndex < paths.length; pathsIndex++) {
      const value = JSONPath({ path: paths[pathsIndex], json: json }) || '';

      if (value) {
        values.push(value);
      }
    }

    return values;
  }

  /**
   * Groups all of the DWC records based on DWC sheet name.
   *
   * @param {Record<DWCSheetName, Record<DWCColumnName, string>[]>[]} processedHierarchicalRowObjects
   * @return {*}  {Record<DWCSheetName, Record<DWCColumnName, string>[]>}
   * @memberof XLSXTransform
   */
  prepareRowObjectsForJSONToSheet(
    processedHierarchicalRowObjects: Record<DWCSheetName, Record<DWCColumnName, string>[]>[]
  ): Record<DWCSheetName, Record<DWCColumnName, string>[]> {
    const groupedByDWCSheetName: Record<DWCSheetName, Record<DWCColumnName, string>[]> = {};
    const uniqueGroupedByDWCSheetName: Record<DWCSheetName, Record<DWCColumnName, string>[]> = {};

    const dwcSheetNames = this.schemaParser.getDWCSheetNames();

    dwcSheetNames.forEach((sheetName) => {
      groupedByDWCSheetName[sheetName] = [];
      uniqueGroupedByDWCSheetName[sheetName] = [];
    });

    processedHierarchicalRowObjects.map((item) => {
      const entries = Object.entries(item);

      for (const [key, value] of entries) {
        groupedByDWCSheetName[key] = groupedByDWCSheetName[key].concat(value);
      }
    });

    Object.entries(groupedByDWCSheetName).forEach(([key, value]) => {
      const keys = this.schemaParser.getDWCSheetKeyBySheetName(key);
      uniqueGroupedByDWCSheetName[key] = filterDuplicateKeys(value, keys) as any;
    });

    return uniqueGroupedByDWCSheetName;
  }

  _getNextUniqueNumber(): number {
    return this._uniqueIncrement++;
  }
}
