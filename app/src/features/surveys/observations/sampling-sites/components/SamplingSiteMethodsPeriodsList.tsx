import { List, ListItem, ListItemText } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import { CodesContext } from 'contexts/codesContext';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import SamplingPeriodsTimeline from '../list/SamplingSiteListPeriod';
import SamplingSiteMethodResponseMetricChip from './SamplingSiteMethodResponseMetricChip';

interface ISamplingSiteMethodsPeriodsListProps {
  sampleSite: IGetSampleLocationDetails;
}

const SamplingSiteMethodsPeriodsList = (props: ISamplingSiteMethodsPeriodsListProps) => {
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  return (
    <List
      disablePadding
      sx={{
        '& .MuiListItemText-primary': {
          fontWeight: 700,
          fontSize: '0.85rem'
        }
      }}>
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
