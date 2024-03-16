import { colors, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { CodesContext } from 'contexts/codesContext';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import { IStratumChipColours } from '../SamplingSiteList';
import SamplingPeriodsTimeline from './SamplingPeriodsTimeline';
import SamplingSiteMethodResponseMetricChip from './SamplingSiteMethodResponseMetricChip';

interface ISamplingSiteMethodsPeriodsListProps {
  sampleSite: IGetSampleLocationDetails;
  stratumChipColours: IStratumChipColours[];
}

const SamplingSiteMethodsPeriodsList = (props: ISamplingSiteMethodsPeriodsListProps) => {
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const orderedColours = [colors.purple, colors.blue, colors.amber, colors.deepOrange, colors.pink];

  const stratumsWithColour =
    props.sampleSite.sample_stratums?.map((item, index) => ({
      name: item.name,
      description: item.description,
      colour: orderedColours[index / (props.sampleSite.sample_stratums?.length ?? 1)]
    })) ?? [];

  return (
    <List
      disablePadding
      sx={{
        '& .MuiListItemText-primary': {
          fontWeight: 700,
          fontSize: '0.8rem'
        }
      }}>
      {stratumsWithColour.length > 0 && (
        <Box mb={2}>
          <Stack direction="row" spacing={1}>
            {stratumsWithColour.map((stratum) => (
              <ColouredRectangleChip
                colour={props.stratumChipColours.find((colour) => colour.stratum === stratum.name)?.colour ?? grey}
                label={stratum.name}
                title="Stratum"
              />
            ))}
          </Stack>
        </Box>
      )}
      <Typography
        color="textSecondary"
        mb={1}
        sx={{
          fontWeight: 700,
          letterSpacing: '0.02rem',
          textTransform: 'uppercase',
          fontSize: '0.7rem'
        }}>
        Methods
      </Typography>
      {props.sampleSite.sample_methods?.map((sampleMethod) => {
        return (
          <ListItem
            disableGutters
            key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
            sx={{
              display: 'block',
              p: 0
            }}>
            <Box
              style={{
                display: 'flex',
                justifyContent: 'start',
                alignItems: 'center',
                backgroundColor: grey[100],
                borderRadius: '5px'
              }}>
              <ListItemText
                sx={{
                  px: 2,
                  py: 1
                }}
                title="Sampling Method"
                primary={getCodesName(
                  codesContext.codesDataLoader.data,
                  'sample_methods',
                  sampleMethod.method_lookup_id
                )}
              />
              <SamplingSiteMethodResponseMetricChip
                // strong
                // inverse
                method_response_metric_id={sampleMethod.method_response_metric_id}
              />
            </Box>
            {sampleMethod.sample_periods && <SamplingPeriodsTimeline samplePeriods={sampleMethod.sample_periods} />}
            
          </ListItem>
        );
      })}
    </List>
  );
};

export default SamplingSiteMethodsPeriodsList;
