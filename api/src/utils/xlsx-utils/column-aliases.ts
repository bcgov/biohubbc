export const CSV_COLUMN_ALIASES: Record<Uppercase<string>, Uppercase<string>[]> = {
  ITIS_TSN: ['TAXON', 'SPECIES', 'TSN'],
  LATITUDE: ['LAT'],
  LONGITUDE: ['LON', 'LONG', 'LNG'],
  DESCRIPTION: ['COMMENT'],
  ALIAS: ['NICKNAME'],
  MARKING_TYPE: ['TYPE']
};
