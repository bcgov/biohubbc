import {
  DWCColumnName,
  JSONPathString,
  MapFieldSchema,
  TemplateColumnName,
  TemplateSheetName
} from '../../../api/src/utils/media/xlsx/transformation/xlsx-transform-schema-parser';

/**
 * Get a json path query string that fetches one or more values within an element where `_name=<sheetName>`.
 *
 * @param {TemplateSheetName} templateSheetName
 * @param {TemplateColumnName[]} templateColumnNames
 * @return {*}  {JSONPathString}
 */
export const getValuesByName = (
  templateSheetName: TemplateSheetName,
  templateColumnNames: TemplateColumnName[]
): JSONPathString => `$..[?(@._name === '${templateSheetName}')]..['${templateColumnNames.join(',')}']`;

/**
 * Create a DWC map `MapFieldSchema` object from a static value.
 *
 * @param {DWCColumnName} dwcColumnName
 * @param {string} staticValue
 * @return {*}  {MapFieldSchema}
 */
export const createValueField = (dwcColumnName: DWCColumnName, staticValue: string): MapFieldSchema => {
  return {
    columnName: dwcColumnName,
    columnValue: [
      {
        static: staticValue
      }
    ]
  };
};

/**
 * Create a DWC map `MapFieldSchema` object from a single JSONPathString.
 *
 * @param {DWCColumnName} dwcColumnName
 * @param {TemplateSheetName} templateSheetName
 * @param {TemplateColumnName[]} templateSheetColumns
 * @return {*}  {MapFieldSchema}
 */
export const createPathField = (
  dwcColumnName: DWCColumnName,
  templateSheetName: TemplateSheetName,
  templateSheetColumns: TemplateColumnName[]
): MapFieldSchema => {
  return {
    columnName: dwcColumnName,
    columnValue: [
      {
        paths: templateSheetColumns.map((item) => getValuesByName(templateSheetName, [item]))
      }
    ]
  };
};
