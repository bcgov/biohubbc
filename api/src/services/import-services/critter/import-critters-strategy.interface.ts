/**
 * A validated CSV Critter object
 *
 */
export type CsvCritter = {
  critter_id: string;
  sex: string;
  itis_tsn: number;
  animal_id: string;
  wlh_id?: string;
  critter_comment?: string;
} & {
  [collectionUnitColumn: string]: unknown;
};

/**
 * Invalidated CSV Critter object
 *
 */
export type PartialCsvCritter = Partial<CsvCritter> & { critter_id: string };
