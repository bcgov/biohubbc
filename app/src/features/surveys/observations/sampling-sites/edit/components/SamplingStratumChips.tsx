import { Color, colors } from '@mui/material';
import { Box, Stack } from '@mui/system';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { SurveyContext } from 'contexts/surveyContext';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext } from 'react';

interface IStratumChipColours {
  stratum: string;
  colour: Color;
}

interface ISamplingStratumChips {
  sampleSite: IGetSampleLocationDetails;
}

const SamplingStratumChips = (props: ISamplingStratumChips) => {
  const surveyContext = useContext(SurveyContext);

  // Determine colours for stratum labels
  const orderedColours = [colors.purple, colors.blue, colors.pink, colors.orange, colors.cyan, colors.teal];
  const stratums = surveyContext.surveyDataLoader.data?.surveyData.site_selection.stratums;
  const stratumChipColours: IStratumChipColours[] =
    stratums?.map((stratum, index) => ({
      stratum: stratum.name,
      colour: orderedColours[index % orderedColours.length]
    })) ?? [];

  return (
    <Box mb={2}>
      <Stack direction="row" spacing={1}>
        {props.sampleSite.sample_stratums?.map((stratum) => (
          <ColouredRectangleChip
            colour={stratumChipColours.find((colour) => colour.stratum === stratum.name)?.colour ?? colors.grey}
            label={stratum.name}
            title="Stratum"
          />
        ))}
      </Stack>
    </Box>
  );
};

export default SamplingStratumChips;
