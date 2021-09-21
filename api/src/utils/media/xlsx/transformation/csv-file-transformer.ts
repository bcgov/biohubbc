// import { CSVWorksheet } from '../../../../utils/media/csv/csv-file';
import { XLSXCSVTransformer } from '../xlsx-file';

export type BasicTransformerConfig = {
  basic_transformer: {
    coreid: {
      file: 'string';
      columns: string[];
    };
    source: {
      file: 'string';
      column: 'string';
    };
    target: {
      file: 'string';
      column: 'string';
    };
    extra?: {
      additional_targets: {
        targets: { file: string; column: string; value: string | number }[];
      };
    };
    pivot?: string;
  };
};

export const getBasicTransformer = (config?: BasicTransformerConfig): XLSXCSVTransformer => {
  return {
    pivot: config?.basic_transformer?.pivot || '',
    transform: (xlsxCsv, modifiers) => {
      if (!config) {
        return xlsxCsv;
      }

      const sourceWorksheet = xlsxCsv.workbook.getWorksheet(config.basic_transformer.source.file);

      if (!sourceWorksheet) {
        return xlsxCsv;
      }

      const columns = sourceWorksheet.getColumnWithCoreId(
        config.basic_transformer.coreid,
        config.basic_transformer.source.column,
        (modifiers && modifiers['pivot']) || ''
      );

      columns.forEach((column) => {
        xlsxCsv.xlsxTransformationTarget.ensureFile(config.basic_transformer.target.file);
        const targetFileIndex = xlsxCsv.xlsxTransformationTarget.getFileIndex(config.basic_transformer.target.file);
        // const coreid = xlsxCsv.xlsxTransformationTarget.hasCoreId(config.basic_transformer.coreid);
        // const coreid = getCoreId(config.basic_transformer.coreid, xlsxCsv);
        // const targetRowIndex = xlsxCsv.xlsxTransformationTarget.getCurrentRowIndex(targetFileIndex);

        // console.log('targetFileIndex', targetFileIndex);
        // console.log('column', column);
        // console.log('targetRowIndex', targetRowIndex);

        xlsxCsv.xlsxTransformationTarget.addColumn(targetFileIndex, {
          id: column.id,
          name: config.basic_transformer.target.column,
          value: column.value
        });

        if (column.value === undefined || column.value === null || column.value === '') {
          return;
        }

        if (config.basic_transformer?.extra?.additional_targets) {
          config.basic_transformer?.extra?.additional_targets.targets.forEach((additionalTarget) => {
            xlsxCsv.xlsxTransformationTarget.addColumn(targetFileIndex, {
              id: column.id,
              name: additionalTarget.column,
              value: additionalTarget.value
            });
          });
        }
      });

      return xlsxCsv;
    }
  };
};

// const getCoreId = (coreid: { file: 'string'; columns: string[] }, xlsxCsv: XLSXCSV): string | number | null => {
//   const worksheet = xlsxCsv.workbook.getWorksheet(coreid.file);

//   if (!worksheet) {
//     return null;
//   }

//   const rows = worksheet.getRows();

//   let filteredRows = rows;

//   coreid.columns.forEach((col, index) => {
//     console.log(`${index}: `, filteredRows);
//     const headerIndex = worksheet.getHeaderIndex(col);
//     filteredRows = filteredRows.filter((row) => {
//       return row[headerIndex] === col;
//     });
//   });

//   console.log(filteredRows);

//   return null;
// };
