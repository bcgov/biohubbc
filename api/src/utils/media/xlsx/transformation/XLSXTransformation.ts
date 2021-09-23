import { isEqual, uniqWith } from 'lodash';
import xlsx from 'xlsx';
import { XLSXCSV } from '../xlsx-file';
import { FileTransformationSchema, TransformationSchemaParser } from './transformation-schema-parser';

export class XLSXTransformation {
  transformationSchemaParser: TransformationSchemaParser;
  xlsxCsv: XLSXCSV;

  constructor(transformationSchemaParser: TransformationSchemaParser, xlsxCsv: XLSXCSV) {
    this.transformationSchemaParser = transformationSchemaParser;
    this.xlsxCsv = xlsxCsv;
  }

  flattenData() {
    const rowsBySourceFileArray: { sourceFile: string; uniqueId: any; row: object }[][] = [];

    Object.entries(this.xlsxCsv.workbook.worksheets).forEach(([fileName, worksheet]) => {
      const fileStructure = this.transformationSchemaParser.getFileStructureSchemas(fileName);

      if (!fileStructure) {
        return;
      }

      const rows = worksheet.getRowObjects();

      if (!fileStructure.parent) {
        // Handle root records

        rows.forEach((row, rowIndex) => {
          const uniqueId = fileStructure.uniqueId
            .map((uniqueIdColumn) => worksheet.getCell(uniqueIdColumn, rowIndex))
            .join(':');

          const newRecord = {
            sourceFile: fileStructure.name,
            uniqueId: uniqueId,
            row: row
          };

          rowsBySourceFileArray.push([newRecord]);
        });
      } else {
        // Handle child records

        rows.forEach((row, rowIndex) => {
          const parentFile = fileStructure.parent?.name;
          const parentUniqueId = fileStructure.parent?.key
            .map((uniqueIdColumn) => worksheet.getCell(uniqueIdColumn, rowIndex))
            .join(':');

          const uniqueId = fileStructure.uniqueId
            .map((uniqueIdColumn) => worksheet.getCell(uniqueIdColumn, rowIndex))
            .join(':');

          const sourceFile = fileStructure.name;

          const newRecord = {
            sourceFile: sourceFile,
            uniqueId: uniqueId,
            row: row
          };

          const recordsToModify: { rowsBySourceFileIndex: number; rowBySourceFileIndex: number }[] = [];
          let recordsToModifyCurrentIndex = 0;
          // let matchingFlattenedRowIndex = -1; // Index of a matching parent record
          // let matchingSourceRecordIndex = -1; // Index of a matching child record in the parent record

          // console.log('--------------------');
          // console.log(parentFile);
          // console.log(parentUniqueId);
          // console.log(newRecord);
          // console.log('--------------------');
          // console.log(rowsBySourceFileArray);
          // console.log('--------------------');

          rowsBySourceFileArray.forEach((rowsBySourceFile, rowsBySourceFileIndex) => {
            let foundMatchingRecord = false;
            rowsBySourceFile.forEach((rowBySourceFile, rowBySourceFileIndex) => {
              if (rowBySourceFile.sourceFile === parentFile && rowBySourceFile.uniqueId === parentUniqueId) {
                // matchingFlattenedRowIndex = rowsBySourceFileIndex;

                recordsToModify[recordsToModifyCurrentIndex] = {
                  ...recordsToModify[recordsToModifyCurrentIndex],
                  rowsBySourceFileIndex
                };
                foundMatchingRecord = true;
              } else if (rowBySourceFile.sourceFile === sourceFile) {
                // matchingSourceRecordIndex = rowBySourceFileIndex;

                recordsToModify[recordsToModifyCurrentIndex] = {
                  ...recordsToModify[recordsToModifyCurrentIndex],
                  rowBySourceFileIndex
                };
                foundMatchingRecord = true;
              }
            });

            if (foundMatchingRecord) {
              recordsToModifyCurrentIndex++;
            }
          });
          // console.log('===================================');

          // console.log(recordsToModify);

          recordsToModify.forEach((recordToModify) => {
            if (recordToModify.rowsBySourceFileIndex >= 0 && recordToModify.rowBySourceFileIndex >= 0) {
              // console.log('XXX', recordToModify);
              // The matching parent record already had a matching child record, duplicate the parent and overwrite the
              // existing child record with the new child record
              const newRowRecord = [...rowsBySourceFileArray[recordToModify.rowsBySourceFileIndex]];
              newRowRecord[recordToModify.rowBySourceFileIndex] = newRecord;
              rowsBySourceFileArray.push(newRowRecord);
            } else if (recordToModify.rowsBySourceFileIndex >= 0) {
              // console.log('YYY', recordToModify);
              // The matching parent record had no matching child record, add the new child record
              rowsBySourceFileArray[recordToModify.rowsBySourceFileIndex].push(newRecord);
            }
          });
        });
      }
    });

    const mergedAndFlattenedRows: object[][] = [];

    rowsBySourceFileArray.forEach((rowsBySourceFile, index) => {
      rowsBySourceFile.forEach((rowPart) => {
        mergedAndFlattenedRows[index] = { ...mergedAndFlattenedRows[index], ...rowPart.row };
      });
    });

    return mergedAndFlattenedRows;
  }

  transformFlattenedData(mergedAndFlattenedRowsArray: object[][]) {
    const transformationSchemas = this.transformationSchemaParser.getTransformationSchemas();

    const flattenedDWCData: object[] = [];

    mergedAndFlattenedRowsArray.forEach((row, rowIndex) => {
      transformationSchemas.forEach((transformationSchema, transformationIndex) => {
        let newDWCRowParts = {};

        transformationSchema.fileTransformations.forEach((fileTransformationSchema) => {
          const newDWCRow = this._applyFileTransformations(row, fileTransformationSchema);

          if (newDWCRow) {
            newDWCRowParts = { ...newDWCRowParts, ...newDWCRow };
          }
          // const conditionFields = transformationSchema.condition;
          // let skipRecord = false;

          // const newDWCRow = {};
          // console.log('====================');
          // Object.entries(transformationSchema.fields).forEach(([dwcField, config]) => {
          //   let columnValue = undefined;

          //   if (config.columns) {
          //     if (config.columns.length > 1) {
          //       const columnValueParts: any[] = [];

          //       config.columns.forEach((columnName: any) => {
          //         columnValue = row[columnName];

          //         if (columnValue !== undefined && columnValue !== null) {
          //           columnValueParts.push(columnValue);
          //         }
          //       });

          //       columnValue = columnValueParts.join(config?.separator || ' ');
          //     } else if (config.columns.length === 1) {
          //       columnValue = row[config.columns[0]];
          //     }
          //   } else if (config.value) {
          //     columnValue = config.value;
          //   }

          //   // if (config.unique) {
          //   // columnValue = `${columnValue}:${config.unique}-${rowIndex}-${transformationIndex}`;
          //   // }

          //   if (conditionFields.includes(dwcField) && (columnValue === undefined || columnValue === null)) {
          //     skipRecord = true;
          //   }

          //   newDWCRow[dwcField] = columnValue;
          // });

          // if (skipRecord) {
          //   return;
          // }
        });

        flattenedDWCData.push(newDWCRowParts);
      });
    });

    return flattenedDWCData;
  }

  _applyFileTransformations(row: object[], fileTransformationSchema: FileTransformationSchema) {
    const conditionFields = fileTransformationSchema.condition || [];
    let skipRecord = false;

    const newDWCRow = {};
    // console.log('====================');
    Object.entries(fileTransformationSchema.fields).forEach(([dwcField, config]) => {
      let columnValue = undefined;

      if (config.columns) {
        if (config.columns.length > 1) {
          const columnValueParts: any[] = [];

          config.columns.forEach((columnName: any) => {
            columnValue = row[columnName];

            if (columnValue !== undefined && columnValue !== null) {
              columnValueParts.push(columnValue);
            }
          });

          columnValue = columnValueParts.join(config?.separator || ' ');
        } else if (config.columns.length === 1) {
          columnValue = row[config.columns[0]];
        }
      } else if (config.value) {
        columnValue = config.value;
      }

      // if (config.unique) {
      // columnValue = `${columnValue}:${config.unique}-${rowIndex}-${transformationIndex}`;
      // }

      if (conditionFields.includes(dwcField) && (columnValue === undefined || columnValue === null)) {
        skipRecord = true;
      }

      newDWCRow[dwcField] = columnValue;
    });

    if (skipRecord) {
      return;
    }

    return newDWCRow;
  }

  parseTransformedData(flattenedDWCData: object[]) {
    const parseSchemas = this.transformationSchemaParser.getParseSchemas();

    const parsedDWCData: { [key: string]: object[] } = {};

    parseSchemas.forEach((parseSchema) => {
      const fileName = parseSchema.file;
      const columns = parseSchema.columns;
      const conditions = parseSchema.condition || [];

      console.log(conditions);

      if (!parsedDWCData[fileName]) {
        parsedDWCData[fileName] = [];
      }

      flattenedDWCData.forEach((row) => {
        let skipRecord = false;
        const rowDataForFile = {};

        Object.entries(row).forEach(([key, value]) => {
          if (columns.includes(key)) {
            rowDataForFile[key] = value;
          }

          if (conditions.includes(key) && (value === undefined || value === null)) {
            skipRecord = true;
          }
        });

        if (skipRecord) {
          return;
        }

        const recordKeys = Object.keys(rowDataForFile);
        if (!conditions.every((condition) => recordKeys.includes(condition))) {
          // If the rowDataForFile is missing any of the condition fields, then skip it
          return;
        }

        parsedDWCData[fileName].push(rowDataForFile);
      });
    });

    return parsedDWCData;
  }

  margeParsedData(parsedDWCData: { [key: string]: object[] }) {
    Object.entries(parsedDWCData).forEach(([file, rows]) => {
      parsedDWCData[file] = uniqWith(rows, isEqual);
    });

    return parsedDWCData;
  }

  dataToSheet(mergedParsedData: { [key: string]: object[] }) {
    const dwcSheets: { [key: string]: xlsx.WorkSheet } = {};

    Object.entries(mergedParsedData).forEach(([key, rows]) => {
      const worksheet = xlsx.utils.json_to_sheet(rows);
      dwcSheets[key] = worksheet;
    });

    return dwcSheets;
  }
}
