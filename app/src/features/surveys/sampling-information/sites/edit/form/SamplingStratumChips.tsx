import { Color, colors } from '@mui/material';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetSampleLocationDetails } from 'interfaces/useSamplingSiteApi.interface';
import { useContext } from 'react';

interface IStratumChipColours {
  stratum: string;
  colour: Color;
}

interface ISamplingStratumChips {
  sampleSite: IGetSampleLocationDetails;
}

/**
 * Returns horizontal stack of ColouredRectangleChip for displaying sample stratums
 *
 * @param props
 * @returns
 */
export const SamplingStratumChips = (props: ISamplingStratumChips) => {
  const surveyContext = useContext(SurveyContext);

  // Determine colours for stratum labels
  const orderedColours = [colors.purple, colors.blue, colors.pink, colors.teal, colors.cyan, colors.orange];
  const stratums = surveyContext.surveyDataLoader.data?.surveyData.site_selection.stratums;
  const stratumChipColours: IStratumChipColours[] =
    stratums?.map((stratum, index) => ({
      stratum: stratum.name,
      colour: orderedColours[index % orderedColours.length]
    })) ?? [];

  return (
    <Stack direction="row" spacing={1}>
      {props.sampleSite.stratums.map((stratum, index) => (
        <ColouredRectangleChip
          key={`${stratum.name}-${index}`}
          colour={stratumChipColours.find((colour) => colour.stratum === stratum.name)?.colour ?? colors.grey}
          label={stratum.name}
          title="Stratum"
        />
      ))}
    </Stack>
  );
};
