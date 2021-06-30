import { CSVTransformer, CSVWorkBook } from '../csv-file';

export enum SPI_CLASS {
  EVENT = 'event',
  OCCURRENCE = 'occurrence',
  MEASUREMENTORFACT = 'measurementorfact',
  RESOURCERELATIONSHIP = 'resourcerelationship'
}

export interface IBasicCSVTransformRule {
  sourceSheet: string;
  sourceHeader: string;
  targetSheet: string;
  targetHeader: string;
}

const basicCSVTransform = (ruleDetails: IBasicCSVTransformRule): CSVTransformer => {
  return (sourceWorkbook: CSVWorkBook, targetWorkbook: CSVWorkBook) => {
    const sourceWorksheet = sourceWorkbook.worksheets[ruleDetails.sourceSheet];
    const targetWorksheet = targetWorkbook.worksheets[ruleDetails.targetSheet];

    if (!sourceWorksheet || !targetWorksheet) {
      return targetWorkbook;
    }

    const sourceHeaders = sourceWorksheet.getHeaders();
    console.log(sourceHeaders);
    const sourceHeaderIndex = sourceHeaders.indexOf(ruleDetails.sourceHeader);
    const sourceRows = sourceWorksheet.getRows();

    const targetHeaders = targetWorksheet.getHeaders();
    const targetHeaderIndex = targetHeaders.indexOf(ruleDetails.targetHeader);

    for (let sourceRowIndex = 0; sourceRowIndex < sourceRows.length; sourceRowIndex++) {
      const sourceValue = sourceRows[sourceRowIndex][sourceHeaderIndex];

      targetWorksheet.setCell(sourceRowIndex, targetHeaderIndex, sourceValue);
    }

    return targetWorkbook;
  };
};

export const getSPITemplateTransformers = (): any[] => {
  return [
    basicCSVTransform({
      sourceSheet: 'General Survey',
      sourceHeader: 'Date',
      targetSheet: 'event',
      targetHeader: 'eventDate'
    })
  ];
};
