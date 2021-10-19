import { isEqual, uniqWith } from 'lodash';
import xlsx from 'xlsx';
import { CSVWorksheet } from '../../csv/csv-file';
import { XLSXCSV } from '../xlsx-file';
import {
  Condition,
  PostTransformationRelatopnshipSchema,
  TransformationFieldSchema,
  TransformationSchemaParser,
  TransformSchema
} from './transformation-schema-parser';

export type FlattenedRowPartsBySourceFile = {
  sourceFile: string;
  uniqueId: any;
  row: object;
};

export type RowObject = { [key: string]: any };

export type RowsObjectsByFileName = { [key: string]: RowObject[] };

export type XLSXWorksheetByFileName = { [key: string]: xlsx.WorkSheet };

/**
 * Applies transformations to an `XLSXCSV` instance.
 *
 * @export
 * @class XLSXTransformation
 */
export class XLSXTransformation {
  transformationSchemaParser: TransformationSchemaParser;
  xlsxCsv: XLSXCSV;

  constructor(transformationSchemaParser: TransformationSchemaParser, xlsxCsv: XLSXCSV) {
    this.transformationSchemaParser = transformationSchemaParser;
    this.xlsxCsv = xlsxCsv;
  }

  /**
   * Transform the raw XLSX data.
   *
   * @return {*}  {RowsObjectsByFileName}
   * @memberof XLSXTransformation
   */
  transform(): RowsObjectsByFileName {
    const flattenedData = this._flattenData();

    const mergedFlattenedData = this._mergedFlattenedRows(flattenedData);

    const transformedMergedFlattenedData = this._transformFlattenedData(mergedFlattenedData);

    const parsedTransformedMergedFlattenedData = this._parseTransformedData(transformedMergedFlattenedData);

    return this._mergeParsedData(parsedTransformedMergedFlattenedData);
  }

  /**
   * Flattens the worksheet data into arrays of objects.
   *
   * @return {*}  {FlattenedRowPartsBySourceFile[][]}
   * @memberof XLSXTransformation
   */
  _flattenData(): FlattenedRowPartsBySourceFile[][] {
    const rowsBySourceFileArray: FlattenedRowPartsBySourceFile[][] = [];

    Object.entries(this.xlsxCsv.workbook.worksheets).forEach(([worksheetName, worksheet]) => {
      // Get the file structure schema for the given fileName
      const fileStructure = this.transformationSchemaParser.getFlattenSchemas(worksheetName);

      if (!fileStructure) {
        return;
      }

      // Get all rows, as objects
      const rowObjects = worksheet.getRowObjects();

      if (!fileStructure.parent) {
        // Handle root records, that have no parent record

        rowObjects.forEach((rowObject, rowIndex) => {
          const uniqueId = this._buildMultiColumnID(worksheet, rowIndex, fileStructure.uniqueId);

          const newRecord = {
            sourceFile: fileStructure.fileName,
            uniqueId: uniqueId,
            row: rowObject
          };

          rowsBySourceFileArray.push([newRecord]);
        });
      } else {
        // Handle child records, that have a parent record

        const parentFileName = fileStructure.parent.fileName;
        const parentUniqueIdColumns = fileStructure.parent.uniqueId;

        const fileName = fileStructure.fileName;
        const uniqueIdColumns = fileStructure.uniqueId;

        rowObjects.forEach((rowObject, rowIndex) => {
          const parentUniqueId = this._buildMultiColumnID(worksheet, rowIndex, parentUniqueIdColumns);

          const uniqueId = this._buildMultiColumnID(worksheet, rowIndex, uniqueIdColumns);

          const newRecord = {
            sourceFile: fileName,
            uniqueId: uniqueId,
            row: rowObject
          };

          // An array of indexes that tracks which records to add `newRecord` to, and which records should be duplicated
          // before adding `newRecord` to them.
          const recordsToModify: { matchingParentIndex: number; matchingChildIndex: number }[] = [];
          let recordsToModifyIndex = 0;

          let foundRowToModify = false;

          // For each parent array of child arrays of objects
          rowsBySourceFileArray.forEach((rowsBySourceFile, rowsBySourceFileIndex) => {
            if (foundRowToModify) {
              return;
            }

            let foundRecordToModify = false;

            /*
             * Compare the `newRecord` to each object in the child array
             * If a matching parent record is found
             *  - mark this parent array index
             * If a matching child record from the same sourceFile is found
             *  - mark this child array index
             */
            rowsBySourceFile.forEach((rowBySourceFile, rowBySourceFileIndex) => {
              const existingRowFileName = rowBySourceFile.sourceFile;
              const existingRowUniqueId = rowBySourceFile.uniqueId;

              if (existingRowFileName === parentFileName && existingRowUniqueId === parentUniqueId) {
                // This array may need a copy of `newRecord`
                recordsToModify[recordsToModifyIndex] = {
                  ...recordsToModify[recordsToModifyIndex],
                  matchingParentIndex: rowsBySourceFileIndex
                };

                foundRecordToModify = true;
              } else if (existingRowFileName === fileName) {
                // This array already contains a record from the same file as `newRecord` and will need to be duplicated
                recordsToModify[recordsToModifyIndex] = {
                  ...recordsToModify[recordsToModifyIndex],
                  matchingChildIndex: rowBySourceFileIndex
                };

                foundRecordToModify = true;
              }
            });

            if (foundRecordToModify) {
              if (
                recordsToModify[recordsToModifyIndex].matchingParentIndex >= 0 &&
                recordsToModify[recordsToModifyIndex].matchingChildIndex >= 0
              ) {
                // A matching parent row with matching child was found, don't continue checking other rows
                foundRowToModify = true;
              }
              // A record was found after iterating over the previous array, increase the index before we loop over
              // the next array.
              recordsToModifyIndex++;
            }
          });

          // For each `recordsToModify`
          // Apply updates to the existing records based on the `recordsToModify` array.
          recordsToModify.forEach((recordToModify) => {
            if (recordToModify.matchingParentIndex >= 0 && recordToModify.matchingChildIndex >= 0) {
              /*
               * `recordToModify` indicates that a matching parent was found AND a matching child from the same
               * sourceFile was found. Duplicate the array, and in the duplicated array, overwrite the existing
               * matching child with the `newRecord`.
               *
               * Example:
               *
               * Initial state:
               *
               *   newRecord = {sourceFile: 'file2', uniqueId: 3, row: {...}};
               *
               *   rowsBySourceFileArray = [
               *     [
               *       {sourceFile: 'file1', uniqueId: 1, row: {...}}, // matching parent of `newRecord`
               *       {sourceFile: 'file2', uniqueId: 2, row: {...}} // matching child from same sourceFile as `newRecord`
               *     ]
               *   ]
               *
               * Final state:
               *
               *   rowsBySourceFileArray = [
               *     [
               *       {sourceFile: 'file1', uniqueId: 1, row: {...}},
               *       {sourceFile: 'file2', uniqueId: 2, row: {...}}
               *     ],
               *     [
               *       {sourceFile: 'file1', uniqueId: 1, row: {...}},
               *       {sourceFile: 'file2', uniqueId: 3, row: {...}}
               *     ]
               *   ]
               */

              // Copy the existing items into a new array
              const newRowRecord = [...rowsBySourceFileArray[recordToModify.matchingParentIndex]];

              // Overwrite the matching item at index `matchingChildIndex` with our new record
              newRowRecord[recordToModify.matchingChildIndex] = newRecord;

              // Append this new duplicated record to the parent array
              rowsBySourceFileArray.push(newRowRecord);
            } else if (recordToModify.matchingParentIndex >= 0) {
              /*
               * `recordToModify` indicates that a matching parent was found. Add the `newRecord` to this existing
               * array.
               *
               * Example:
               *
               * Initial state:
               *
               *   newRecord = {sourceFile: 'file2', uniqueId: 3, row: {...}};
               *
               *   rowsBySourceFileArray = [
               *     [
               *       {sourceFile: 'file1', uniqueId: 1, row: {...}} // matching parent of `newRecord`
               *     ]
               *   ]
               *
               * Final state:
               *
               *   rowsBySourceFileArray = [
               *     [
               *       {sourceFile: 'file1', uniqueId: 1, row: {...}},
               *       {sourceFile: 'file2', uniqueId: 3, row: {...}}
               *     ]
               *   ]
               */
              rowsBySourceFileArray[recordToModify.matchingParentIndex].push(newRecord);
            }
          });
        });
      }
    });

    return rowsBySourceFileArray;
  }

  _buildMultiColumnID(worksheet: CSVWorksheet, rowIndex: number, columnNames: string[]) {
    return this._buildMultiColumnValue(worksheet, rowIndex, columnNames, ':');
  }

  _buildMultiColumnValue(worksheet: CSVWorksheet, rowIndex: number, columnNames: string[], separator?: string) {
    return columnNames.map((columnName) => worksheet.getCell(columnName, rowIndex)).join(separator || ' ');
  }

  /**
   * Merges the arrays of objects into an array of objects.
   *
   * @param {FlattenedRowPartsBySourceFile[][]} flattenedData
   * @return {*}  {object[][]}
   * @memberof XLSXTransformation
   */
  _mergedFlattenedRows(flattenedData: FlattenedRowPartsBySourceFile[][]): object[] {
    const mergedAndFlattenedRows: object[] = [];

    flattenedData.forEach((rowsBySourceFile, index) => {
      rowsBySourceFile.forEach((rowPart) => {
        mergedAndFlattenedRows[index] = { ...mergedAndFlattenedRows[index], ...rowPart.row };
      });
    });

    return mergedAndFlattenedRows;
  }

  /**
   * Applies transformation logic to the flattened array of objects, creating a new array of objects (which may contain
   * duplicate items)
   *
   * @param {object[]} mergedFlattenedData
   * @return {*}  {object[]}
   * @memberof XLSXTransformation
   */
  _transformFlattenedData(mergedFlattenedData: object[]): object[] {
    const transformSchemasArray = this.transformationSchemaParser.getTransformSchemas();

    let transformedDWCData: object[] = [];

    mergedFlattenedData.forEach((rowObject, rowObjectIndex) => {
      transformSchemasArray.forEach((transformationSchema, transformationSchemaIndex) => {
        const newDWCRowObjects = this._applyFileTransformations(
          rowObject,
          transformationSchema,
          rowObjectIndex,
          transformationSchemaIndex
        );

        transformedDWCData = transformedDWCData.concat(newDWCRowObjects);
      });
    });

    return transformedDWCData;
  }

  _applyFileTransformations(
    rowObject: object,
    transformationSchema: TransformSchema,
    rowObjectIndex: number,
    transformationSchemaIndex: number
  ): object[] {
    if (!this._isConditionMet(rowObject, transformationSchema?.condition)) {
      // condition not met, return an empty array (contains no new records)
      return [];
    }

    let newDWCRowObjects: object[] = [];

    transformationSchema.transformations.forEach((transformation) => {
      const newDWCRowObject = {};

      if (!this._isConditionMet(rowObject, transformation?.condition)) {
        return;
      }

      Object.entries(transformation.fields).forEach(([dwcField, config]) => {
        if (!this._isConditionMet(rowObject, config?.condition)) {
          return;
        }

        let columnValue = this._getColumnValue(rowObject, config);

        if (config.unique) {
          // Append `config.unique` + indexes to ensure this column value is unique
          columnValue = `${columnValue}:${config.unique}-${rowObjectIndex}-${transformationSchemaIndex}`;
        }

        newDWCRowObject[dwcField] = columnValue;
      });

      newDWCRowObjects.push(newDWCRowObject);
    });

    transformationSchema?.postTransformations?.forEach((postTransformation) => {
      if (!this._isConditionMet(rowObject, postTransformation.condition)) {
        return;
      }

      if (postTransformation.relationship) {
        newDWCRowObjects = this._postTransformRelationships(
          postTransformation as PostTransformationRelatopnshipSchema,
          newDWCRowObjects
        );
      }
    });

    return newDWCRowObjects;
  }

  _postTransformRelationships = (
    postTransformRelationshipSchema: PostTransformationRelatopnshipSchema,
    originalDWCRowObjects: object[]
  ) => {
    // Spread the parent/child row objects and update relationship fields

    const spreadColumn = postTransformRelationshipSchema.relationship.spreadColumn;
    const uniqueIdColumn = postTransformRelationshipSchema.relationship.uniqueIdColumn;

    let spreadDWCRowObjects: object[] = [];

    if (spreadColumn) {
      const originalParentRecord = originalDWCRowObjects[0];
      const originalChildRecord = originalDWCRowObjects[1];

      const spreadColumnValue = Number(originalParentRecord[spreadColumn]);

      if (spreadColumnValue) {
        for (let i = 0; i < spreadColumnValue; i++) {
          const newParentRecord = {
            ...originalParentRecord,
            [spreadColumn]: 1,
            [uniqueIdColumn]: `${originalParentRecord[uniqueIdColumn]}-${i}-0`
          };
          const newChildRecord = {
            ...originalChildRecord,
            [uniqueIdColumn]: `${originalChildRecord[uniqueIdColumn]}-${i}-1`
          };

          newParentRecord['resourceID'] = newParentRecord[uniqueIdColumn];
          newParentRecord['relatedResourceID'] = newChildRecord[uniqueIdColumn];

          newChildRecord['resourceID'] = newChildRecord[uniqueIdColumn];
          newChildRecord['relatedResourceID'] = newParentRecord[uniqueIdColumn];

          spreadDWCRowObjects = spreadDWCRowObjects.concat([newParentRecord, newChildRecord]);
        }
      }
    }

    return spreadDWCRowObjects;
  };

  /**
   * Builds a new value from the `rowObject`, based on the config.
   *
   * This may involve returning a single `rowObject` value, concatenating multiple `rowObject` values together, or
   * returning a static value.
   *
   * @param {object} rowObject
   * @param {(TransformationFieldSchema | undefined)} config
   * @return {*}  {*}
   * @memberof XLSXTransformation
   */
  _getColumnValue(rowObject: object, config: TransformationFieldSchema | undefined): any {
    if (!config) {
      return;
    }

    let columnValue = undefined;

    if (config.columns) {
      const columnsValues = this._getColumnValueParts(rowObject, config.columns);

      if (columnsValues && columnsValues.length) {
        columnValue = columnsValues.join(config?.separator || ' ');
      }
    }

    if (config.value) {
      columnValue = config.value;
    }

    return columnValue;
  }

  /**
   * Given an array of column names, return an array of matching column values.
   *
   * @param {object} rowObject
   * @param {string[]} columnNames
   * @return {*}  {((string | number)[] | undefined)}
   * @memberof XLSXTransformation
   */
  _getColumnValueParts(rowObject: object, columnNames: string[]): (string | number)[] | undefined {
    if (!rowObject || !columnNames || !columnNames.length) {
      return undefined;
    }

    const columnValueParts: any[] = [];

    columnNames.forEach((columnName) => {
      const columnValue = rowObject[columnName];

      if (columnValue !== undefined && columnValue !== null && columnValue !== '') {
        columnValueParts.push(columnValue);
      }
    });

    return columnValueParts;
  }

  /**
   * Returns true if the `condition` is met.
   *
   * @param {object} rowObject
   * @param {(Condition | undefined)} condition
   * @return {*}  {boolean}
   * @memberof XLSXTransformation
   */
  _isConditionMet(rowObject: object, condition?: Condition): boolean {
    if (!condition) {
      // no conditions specified
      return true;
    }

    const columnValueParts = this._getColumnValueParts(rowObject, condition.if.columns);

    if (!columnValueParts || !columnValueParts.length) {
      return false;
    }

    for (const columnValuePart in columnValueParts) {
      if (columnValuePart === undefined || columnValuePart === null || columnValuePart === '') {
        return false;
      }
    }

    // all conditions met
    return true;
  }

  /**
   * Parses the array of objects into separate arrays of objects (which may contain duplicate items), based on fileName.
   *
   * @param {object[]} transformedMergedFlattenedData
   * @return {*}  {RowsObjectsByFileName}
   * @memberof XLSXTransformation
   */
  _parseTransformedData(transformedMergedFlattenedData: object[]): RowsObjectsByFileName {
    const parseSchemas = this.transformationSchemaParser.getParseSchemas();

    const parsedDWCData: RowsObjectsByFileName = {};

    parseSchemas.forEach((parseSchema) => {
      const fileName = parseSchema.fileName;
      const columns = parseSchema.columns;

      if (!parsedDWCData[fileName]) {
        // initialize an empty array for the current fileName if one does not yet exist
        parsedDWCData[fileName] = [];
      }

      transformedMergedFlattenedData.forEach((rowObject) => {
        if (!this._isConditionMet(rowObject, parseSchema?.condition)) {
          // A conditional field was undefined or null, skip this record
          return;
        }

        const newRowObject = {};

        Object.entries(rowObject).forEach(([dwcField, value]) => {
          for (const column of columns) {
            if (column.source === dwcField) {
              newRowObject[column.target] = value;
              break;
            }
          }
        });

        const newRowObjectKeys = Object.keys(newRowObject);

        if (
          parseSchema?.condition &&
          !parseSchema?.condition?.if?.columns.every((conditionalFields) =>
            newRowObjectKeys.includes(conditionalFields)
          )
        ) {
          // If the `newRowObject` is missing any of the conditional fields, skip this record
          return;
        }

        parsedDWCData[fileName].push(newRowObject);
      });
    });

    return parsedDWCData;
  }

  /**
   * Merges the array of objects for each fileName, removing duplicate items.
   *
   * @param {RowsObjectsByFileName} parsedDWCData
   * @return {*}  {RowsObjectsByFileName}
   * @memberof XLSXTransformation
   */
  _mergeParsedData(parsedTransformedMergedFlattenedData: RowsObjectsByFileName): RowsObjectsByFileName {
    // For each entry (based on fileName), do a deep equality check on each of its row objects, removing any duplicates.
    Object.entries(parsedTransformedMergedFlattenedData).forEach(([fileName, rowObjects]) => {
      parsedTransformedMergedFlattenedData[fileName] = uniqWith(rowObjects, isEqual);
    });

    return parsedTransformedMergedFlattenedData;
  }

  /**
   * Converts an object (whose keys are file names, and whose value is an array of objects) into a new object (whose
   * keys are file names, and whose value is an `xlsx.Worksheet`).
   *
   * @param {RowsObjectsByFileName} mergedParsedData
   * @return {*}  {XLSXWorksheetByFileName}
   * @memberof XLSXTransformation
   */
  dataToSheet(mergedParsedTransformedData: RowsObjectsByFileName): XLSXWorksheetByFileName {
    const sheets: XLSXWorksheetByFileName = {};

    Object.entries(mergedParsedTransformedData).forEach(([fileName, rowObjects]) => {
      const worksheet = xlsx.utils.json_to_sheet(rowObjects);
      sheets[fileName] = worksheet;
    });

    return sheets;
  }
}
