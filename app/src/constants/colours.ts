import { Color } from '@mui/material';
import {
  blue,
  blueGrey,
  brown,
  cyan,
  deepOrange,
  deepPurple,
  green,
  grey,
  indigo,
  orange,
  pink,
  purple,
  red,
  teal
} from '@mui/material/colors';

type ColourMap = Record<string, { colour: Color }>;

/**
 * Default colour fallback.
 *
 */
const DEFAULT_COLOUR = blueGrey;

/**
 * Colour map for `Survey Progress` chips.
 *
 */
const SURVEY_PROGRESS_COLOUR_MAP = {
  Planning: { colour: blueGrey },
  'In progress': { colour: deepPurple },
  Completed: { colour: green }
};

/**
 * Colour map for `Taxon Rank` chips.
 *
 */
const TAXON_RANK_COLOUR_MAP = {
  Subspecies: { colour: blue },
  Variety: { colour: blue },
  Species: { colour: purple },
  Genus: { colour: teal },
  Family: { colour: red },
  Order: { colour: indigo },
  Class: { colour: deepOrange },
  Phylum: { colour: pink },
  Kingdom: { colour: grey }
};

/**
 * Colour map for `NRM Region` chips.
 *
 */
const NRM_REGION_COLOUR_MAP = {
  'Kootenay-Boundary Natural Resource Region': { colour: cyan },
  'Thompson-Okanagan Natural Resource Region': { colour: orange },
  'West Coast Natural Resource Region': { colour: green },
  'Cariboo Natural Resource Region': { colour: deepPurple },
  'South Coast Natural Resource Region': { colour: blue },
  'Northeast Natural Resource Region': { colour: brown },
  'Omineca Natural Resource Region': { colour: pink },
  'Skeena Natural Resource Region': { colour: red }
};

/**
 * Generate colour getter from ColourMap.
 *
 * @param {ColourMap} colourMap
 * @param {Color} [fallbackColour]
 * @returns {(lookup: string) => Color} Colour getter
 */
const generateColourMapGetter = <T extends ColourMap>(colourMap: T, fallbackColour = DEFAULT_COLOUR) => {
  return (lookup: string) => colourMap[lookup]?.colour ?? fallbackColour;
};

/**
 * Get survey progress colour mapping.
 *
 */
export const getSurveyProgressColour = generateColourMapGetter(SURVEY_PROGRESS_COLOUR_MAP);

/**
 * Get taxon rank colour mapping.
 *
 */
export const getTaxonRankColour = generateColourMapGetter(TAXON_RANK_COLOUR_MAP);

/**
 * Get NRM region colour mapping.
 *
 */
export const getNrmRegionColour = generateColourMapGetter(NRM_REGION_COLOUR_MAP);
