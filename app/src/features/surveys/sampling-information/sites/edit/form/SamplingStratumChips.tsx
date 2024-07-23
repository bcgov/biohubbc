import { blue, cyan, orange, pink, purple, teal } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';

const SAMPLING_SITE_CHIP_COLOURS = [purple, blue, pink, teal, cyan, orange];

interface ISamplingStratumChipsProps {
  sampleSite: IGetSampleLocationDetails;
}

/**
 * Returns horizontal stack of ColouredRectangleChip for displaying sample stratums
 *
 * @param {ISamplingStratumChipsProps} props
 * @returns {*}
 */
export const SamplingStratumChips = (props: ISamplingStratumChipsProps) => {
  return (
    <Stack direction="row" spacing={1}>
      {props.sampleSite.stratums.map((stratum, index) => (
        <ColouredRectangleChip
          key={`${stratum.name}-${index}`}
          colour={
            // Cycle through the sampling site chip colours
            SAMPLING_SITE_CHIP_COLOURS[index] ?? SAMPLING_SITE_CHIP_COLOURS[index % SAMPLING_SITE_CHIP_COLOURS.length]
          }
          label={stratum.name}
          title="Stratum"
        />
      ))}
    </Stack>
  );
};
