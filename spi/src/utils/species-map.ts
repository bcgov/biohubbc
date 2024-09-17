import fs from 'fs';
import xlsx from 'xlsx';

export interface ISpiSpeciesObject {
  ID: number;
  UNIT_NAME1: string;
  UNIT_NAME2: string;
  UNIT_NAME3: string;
  CODE: string;
  ENGLISH_NAME: string;
  TTY_KINGDOM: string;
  TTY_NAME: string;
  TXN_ID: number;
  SENSITIVE_DATA_FLAG: string;
  PHYLO_SORT_SEQUENCE: number;
}

/**
 * Get the ITIS SORL search-by-term URL.
 *
 * @param {string[]} scientificNames
 * @return {*}  {Promise<string>}
 * @memberof ItisService
 */
export const getItisSolrTermSearchUrl = (scientificNames: string[]): string => {
  const itisUrl = 'https://services.itis.gov';

  return `${itisUrl}?${_getItisTsnSearchUrl(scientificNames)}`;
};

/**
 * Get ITIS Tsn for scientific names
 *
 * @param {string[]} scientificNames
 * @return {*}  {string}
 */
function _getItisTsnSearchUrl(scientificNames: string[]): string {
  const queryParams = scientificNames
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => {
      // Logical OR between scientific name and vernacular name. Reformatting spaces for ITIS SOLR syntax.
      return `((nameWOInd:${name.replace(/ /g, '\\%20')})+OR+(vernacular:${name.replace(/ /g, '\\%20')}))`;
    })
    .join('+OR+');

  // Multiplying length by 2 for good luck; it should only need to be the length of scientificNames but one requested
  // name might yield 2 ITIS records in the response.
  return `q=${queryParams}&rows=${scientificNames.length * 2}`;
}

// Define the function to read and process the CSV file
export const readCsvToJson = (filepath: string): ISpiSpeciesObject[] => {
  // Read the CSV file from the directory
  const fileBuffer = fs.readFileSync(filepath);

  // Parse the CSV file buffer using xlsx
  const workbook = xlsx.read(fileBuffer, { type: 'buffer', cellDates: true, cellNF: true, cellHTML: false });

  // Get the first sheet's name
  const sheetName = workbook.SheetNames[0];

  // Get the sheet data
  const sheet = workbook.Sheets[sheetName];

  // Convert the sheet data to JSON (or any other format you need)
  const data = xlsx.utils.sheet_to_json(sheet) as ISpiSpeciesObject[];

  return data;
};
