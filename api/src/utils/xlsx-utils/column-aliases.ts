export const CSV_COLUMN_ALIASES: Record<Uppercase<string>, Uppercase<string>[]> = {
  ITIS_TSN: ['TAXON', 'SPECIES', 'TSN'],
  LATITUDE: ['LAT'],
  LONGITUDE: ['LON', 'LONG', 'LNG'],
  DESCRIPTION: ['COMMENT', 'COMMENTS', 'NOTES'],
  ALIAS: ['NICKNAME', 'ANIMAL'],
  MARKING_TYPE: ['TYPE'],
  OBSERVATION_SUBCOUNT_SIGN: ['SIGN']
};
