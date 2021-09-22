import { uniqWith, isEqual } from 'lodash';
import xlsx from 'xlsx';
import { CSVWorkBook, CSVWorksheet, ICsvState } from '../csv/csv-file';
import { DEFAULT_XLSX_SHEET } from '../dwc/dwc-archive-file';
import { IMediaState, MediaFile, MediaValidation } from '../media-file';
import { ValidationSchemaParser } from '../validation/validation-schema-parser';
import { TransformationSchemaParser } from './transformation/transformation-schema-parser';
import { SourceFileTransformer, XLSXTransformationTarget } from './transformation/XLSXTransformation';

/**
 * Supports XLSX CSV files.
 *
 * @export
 * @class XLSXCSV
 */
export class XLSXCSV {
  rawFile: MediaFile;

  mediaValidation: MediaValidation;

  workbook: CSVWorkBook;

  xlsxTransformationTarget: XLSXTransformationTarget;

  constructor(file: MediaFile, options?: xlsx.ParsingOptions) {
    this.rawFile = file;

    this.mediaValidation = new MediaValidation(this.rawFile.fileName);

    this.workbook = new CSVWorkBook(xlsx.read(this.rawFile.buffer, { ...options }));

    this.xlsxTransformationTarget = new XLSXTransformationTarget();
  }

  isMediaValid(validationSchemaParser: ValidationSchemaParser): IMediaState {
    const validators = validationSchemaParser.getSubmissionValidations();

    const mediaValidation = this.validate(validators as XLSXCSVValidator[]);

    return mediaValidation.getState();
  }

  isContentValid(validationSchemaParser: ValidationSchemaParser): ICsvState[] {
    const csvStates: ICsvState[] = [];

    Object.keys(this.workbook.worksheets).forEach((fileName) => {
      const fileValidators = validationSchemaParser.getFileValidations(fileName);

      const columnValidators = validationSchemaParser.getAllColumnValidations(fileName);

      const validators = [...fileValidators, ...columnValidators];

      const worksheet: CSVWorksheet = this.workbook.worksheets[fileName];

      if (!worksheet) {
        return;
      }

      const csvValidation = worksheet.validate(validators);

      csvStates.push(csvValidation.getState());
    });

    return csvStates;
  }

  flattenData(transformationSchemaParser: TransformationSchemaParser) {
    // const headersBySourceFileArray: { sourceFile: string; headers: any[] }[] = [];
    const flattenedRowsBySourceFileArray: { sourceFile: string; uniqueId: any; row: object }[][] = [];

    Object.entries(this.workbook.worksheets).forEach(([fileName, worksheet]) => {
      const fileStructure = transformationSchemaParser.getFileStructureSchemas(fileName);

      if (!fileStructure) {
        return;
      }

      // headersBySourceFileArray.push({ sourceFile: fileName, headers: worksheet.getHeaders() });

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

          flattenedRowsBySourceFileArray.push([newRecord]);
        });
      } else {
        // Handle child records

        rows.forEach((row, rowIndex) => {
          const parentName = fileStructure.parent?.name;
          const parentUniqueId = fileStructure.parent?.key
            .map((uniqueIdColumn) => worksheet.getCell(uniqueIdColumn, rowIndex))
            .join(':');

          const uniqueId = fileStructure.uniqueId
            .map((uniqueIdColumn) => worksheet.getCell(uniqueIdColumn, rowIndex))
            .join(':');

          const newRecord = {
            sourceFile: fileStructure.name,
            uniqueId: uniqueId,
            row: row
          };

          let matchingFlattenedRowIndex = -1; // Index of a matching parent record
          let matchingSourceRecordIndex = -1; // Index of a matching child record in the parent record

          flattenedRowsBySourceFileArray.forEach((flattenedRows, flattenedRowsIndex) => {
            flattenedRows.forEach((flattenedRow, flattenedRowIndex) => {
              if (flattenedRow.sourceFile === parentName && flattenedRow.uniqueId === parentUniqueId) {
                matchingFlattenedRowIndex = flattenedRowsIndex;
              } else if (flattenedRow.sourceFile === fileStructure.name) {
                matchingSourceRecordIndex = flattenedRowIndex;
              }
            });
          });

          if (matchingSourceRecordIndex >= 0) {
            // The matching parent record already had a matching child record, duplicate the parent and overwrite the
            // existing child record with the new child record
            const newRowRecord = [...flattenedRowsBySourceFileArray[matchingFlattenedRowIndex]];
            newRowRecord[matchingSourceRecordIndex] = newRecord;
            flattenedRowsBySourceFileArray.push(newRowRecord);
          } else {
            // The matching parent record had no matching child record, add the new child record
            flattenedRowsBySourceFileArray[matchingFlattenedRowIndex].push(newRecord);
          }
        });
      }
    });

    // ---------------------------------------------

    // const mergedAndFlattenedRowsArray: any[][] = [];

    // flattenedRowsBySourceFileArray.forEach((flattenedRows, flattenedRowsIndex) => {
    //   mergedAndFlattenedRowsArray[flattenedRowsIndex] = [];

    //   headersBySourceFileArray.forEach((headerArray) => {
    //     // console.log('==================================');
    //     const matchingIndex = flattenedRows.findIndex(
    //       (flattenedRow) => flattenedRow.sourceFile === headerArray.sourceFile
    //     );

    //     // console.log(matchingIndex);

    //     if (matchingIndex < 0) {
    //       for (let i = 0; i < headerArray.headers.length; i++) {
    //         mergedAndFlattenedRowsArray[flattenedRowsIndex].push(undefined);
    //       }
    //     } else {
    //       mergedAndFlattenedRowsArray[flattenedRowsIndex] = [
    //         ...mergedAndFlattenedRowsArray[flattenedRowsIndex],
    //         ...flattenedRows[matchingIndex].row
    //       ];
    //     }

    //     // console.log(mergedAndFlattenedRowsArray);
    //   });
    // });

    // return mergedAndFlattenedRowsArray;

    const mergedAndFlattenedRows: object[][] = [];

    flattenedRowsBySourceFileArray.forEach((flattenedRows, index) => {
      flattenedRows.forEach((rowPart) => {
        mergedAndFlattenedRows[index] = { ...mergedAndFlattenedRows[index], ...rowPart.row };
      });
    });

    return mergedAndFlattenedRows;

    // // ---------------------------------------------

    // let mergedAndFlattenedHeaders: any[] = [];

    // headersBySourceFileArray.forEach((header) => {
    //   mergedAndFlattenedHeaders.concat(header.headers);
    // });

    // const seenHeaders: any[] = [];
    // mergedAndFlattenedHeaders = mergedAndFlattenedHeaders.map((item) => {
    //   if (seenHeaders.includes(item)) {
    //     return undefined;
    //   } else {
    //     seenHeaders.push(item);
    //     return item;
    //   }
    // });

    // // ---------------------------------------------

    // const mergedAndFlattenedAndDeduplicatedData: any[][] = [];

    // for (let i = 0; i < mergedAndFlattenedRowsArray.length; i++) {
    //   mergedAndFlattenedAndDeduplicatedData.push([]);
    // }

    // mergedAndFlattenedHeaders.forEach((header, index) => {
    //   if (header !== undefined) {
    //     mergedAndFlattenedAndDeduplicatedData.push(mergedAndFlattenedRowsArray[index]);
    //   }
    // });

    // return mergedAndFlattenedRowsArray;
  }

  transformFlattenedData(
    mergedAndFlattenedRowsArray: object[][],
    transformationSchemaParser: TransformationSchemaParser
  ) {
    const transformationSchemas = transformationSchemaParser.getTransformationSchemas();

    const flattenedDWCData: object[] = [];

    mergedAndFlattenedRowsArray.forEach((row, rowIndex) => {
      transformationSchemas.forEach((transformationSchema, transformationIndex) => {
        const conditionFields = transformationSchema.condition;
        let skipRecord = false;

        const newDWCRow = {};

        Object.entries(transformationSchema.fields).forEach(([key, config]) => {
          let columnValue = undefined;

          if (config.columns) {
            if (config.columns.length > 1) {
              const columnValueParts: any[] = [];

              config.columns.forEach((columnName: any) => {
                columnValueParts.push(row[columnName]);
              });

              columnValue = columnValueParts.join(config?.separator || ' ');
            } else if (config.columns.length === 1) {
              columnValue = row[config.columns[0]];
            }
          } else if (config.value) {
            columnValue = config.value;
          }

          if (config.unique) {
            // columnValue = `${columnValue}:${config.unique}-${rowIndex}-${transformationIndex}`;
          }

          if (conditionFields.includes(key) && (columnValue === undefined || columnValue === null)) {
            skipRecord = true;
          }

          newDWCRow[key] = columnValue;
        });

        if (skipRecord) {
          return;
        }

        flattenedDWCData.push(newDWCRow);
      });
    });

    return flattenedDWCData;
  }

  parseTransformedData(flattenedDWCData: object[], transformationSchemaParser: TransformationSchemaParser) {
    const parseSchemas = transformationSchemaParser.getParseSchemas();

    const parsedDWCData: { [key: string]: object[] } = {};

    parseSchemas.forEach((item) => {
      const fileName = item.file;
      const columns = item.columns;

      if (!parsedDWCData[fileName]) {
        parsedDWCData[fileName] = [];
      }

      flattenedDWCData.forEach((row) => {
        const rowDataForFile = {};

        Object.entries(row).forEach(([key, value]) => {
          if (columns.includes(key)) {
            rowDataForFile[key] = value;
          }
        });

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

  worksheetToBuffer(worksheet: xlsx.WorkSheet): Buffer {
    const newWorkbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(newWorkbook, worksheet, DEFAULT_XLSX_SHEET);

    return xlsx.write(newWorkbook, { type: 'buffer', bookType: 'csv' }) as Buffer;
  }

  transformToDWC(transformationSchemaParser: TransformationSchemaParser): XLSXTransformationTarget {
    Object.keys(this.workbook.worksheets).forEach((fileName) => {
      const transformers = transformationSchemaParser.getFileTransformations(fileName);

      const fileTransformer = new SourceFileTransformer(fileName, transformers);

      fileTransformer.transform(this);
    });

    return this.xlsxTransformationTarget;
  }

  /**
   * Executes each validator function in the provided `validators` against this instance, returning
   * `this.mediaValidation`
   *
   * @param {XLSXCSVValidator[]} validators
   * @return {*}  {MediaValidation}
   * @memberof XLSXCSV
   */
  validate(validators: XLSXCSVValidator[]): MediaValidation {
    validators.forEach((validator) => validator(this));

    return this.mediaValidation;
  }
}

export type XLSXCSVValidator = (xlsxCsv: XLSXCSV) => XLSXCSV;

export type XLSXCSVTransformer = { pivot: string; transform: (xlsxCsv: XLSXCSV, modifiers?: object) => XLSXCSV };
