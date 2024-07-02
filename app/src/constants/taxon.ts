import { Color } from '@mui/material';
import { blue, deepOrange, grey, indigo, pink, purple, red, teal } from '@mui/material/colors';

export const TaxonRankColours: Record<string, { colour: Color }> = {
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
