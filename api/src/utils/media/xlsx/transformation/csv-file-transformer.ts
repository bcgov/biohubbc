import { XLSXCSVTransformer } from '../xlsx-file';

export type BasicTransformerConfig = {
  basic_transformer: {
    coreid: {
      file: string;
      columns: string[];
    };
    uniqueid: {
      source: {
        file: string;
        columns: string[];
      };
      target: {
        file: string;
        column: string;
      };
    };
    source: {
      file: string;
      column: string;
    };
    target: {
      file: string;
      column: string;
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
        config.basic_transformer.uniqueid,
        config.basic_transformer.source.column,
        (modifiers && modifiers['pivot']) || ''
      );

      columns.forEach((column) => {
        xlsxCsv.xlsxTransformationTarget.ensureFile(config.basic_transformer.target.file);
        const targetFileIndex = xlsxCsv.xlsxTransformationTarget.getFileIndex(config.basic_transformer.target.file);

        xlsxCsv.xlsxTransformationTarget.addColumn(targetFileIndex, {
          coreid: column.coreid,
          uniqueid: column.uniqueid,
          name: config.basic_transformer.target.column,
          value: column.value
        });

        if (column.value === undefined || column.value === null || column.value === '') {
          return;
        }

        if (config.basic_transformer?.extra?.additional_targets) {
          config.basic_transformer?.extra?.additional_targets.targets.forEach((additionalTarget) => {
            xlsxCsv.xlsxTransformationTarget.addColumn(targetFileIndex, {
              coreid: column.coreid,
              uniqueid: column.uniqueid,
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
