import { XLSXCSVTransformer } from '../xlsx-file';

export type BasicTransformerConfig = {
  basic_transformer: {
    source: {
      file: 'string';
      column: 'string';
    };
    target: {
      file: 'string';
      column: 'string';
    };
  };
};

export const getBasicTransformer = (config?: BasicTransformerConfig): XLSXCSVTransformer => {
  return (xlsxCsv) => {
    if (!config) {
      return xlsxCsv;
    }

    const sourceWorksheet = xlsxCsv.workbook.getWorksheet(config.basic_transformer.source.file);

    if (!sourceWorksheet) {
      return xlsxCsv;
    }

    const columnValues = sourceWorksheet.getColumn(config.basic_transformer.source.column);

    columnValues.forEach((columnValue, columnIndex) =>
      xlsxCsv.xlsxTransformation.addColumn(config.basic_transformer.target.file, columnIndex, {
        name: config.basic_transformer.source.column,
        value: columnValue
      })
    );

    return xlsxCsv;
  };
};


