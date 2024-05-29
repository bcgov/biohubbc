import blue from '@mui/material/colors/blue';
import blueGrey from '@mui/material/colors/blueGrey';
import brown from '@mui/material/colors/brown';
import deepPurple from '@mui/material/colors/deepPurple';
import orange from '@mui/material/colors/orange';
import pink from '@mui/material/colors/pink';
import red from '@mui/material/colors/red';
import teal from '@mui/material/colors/teal';
/**
 * `Natural Resource Regions` appended text
 * ie: `Cariboo Natural Resource Region`
 *
 */
export const NRM_REGION_APPENDED_TEXT = ' Natural Resource Region';

/**
 * Used to colour region chips.
 *
 */
export const NRM_REGION_COLOUR_MAP = {
  'Kootenay-Boundary Natural Resource Region': blueGrey,
  'Thompson-Okanagan Natural Resource Region': orange,
  'West Coast Natural Resource Region': teal,
  'Cariboo Natural Resource Region': deepPurple,
  'South Coast Natural Resource Region': blue,
  'Northeast Natural Resource Region': brown,
  'Omineca Natural Resource Region': pink,
  'Skeena Natural Resource Region': red
};

/**
 * Helper function to retrive nrm region colour
 * @param {string} region - name of region
 * @returns {*} mui colour object
 */
export const getNrmRegionColour = (region: string) => {
  return NRM_REGION_COLOUR_MAP[region as keyof typeof NRM_REGION_COLOUR_MAP] ?? blueGrey;
};
