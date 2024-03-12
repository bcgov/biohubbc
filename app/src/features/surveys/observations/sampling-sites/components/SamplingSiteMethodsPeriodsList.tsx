import { mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Chip, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import { CodesContext } from 'contexts/codesContext';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';

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
          typography: 'body2'
        }
      }}>
      {props.sampleSite.sample_methods?.map((sampleMethod) => {
        return (
          <ListItem
            disableGutters
            key={`${sampleMethod.survey_sample_site_id}-${sampleMethod.survey_sample_method_id}`}
            sx={{
              display: 'block',
              p: 0,
              '& + li': {
                mt: 1.5
              }
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
              <Chip
                size="small"
                label={getCodesName(
                  codesContext.codesDataLoader.data,
                  'method_response_metrics',
                  sampleMethod.method_response_metric_id
                )}
                sx={{
                  fontSize: '0.75rem',
                  mx: 2,
                  minWidth: 0,
                  borderRadius: '5px',
                  color: '#fff',
                  backgroundColor: '#97a7db',
                  fontWeight: 700
                }}
              />
            </Box>
            <List disablePadding>
              {sampleMethod.sample_periods?.map((samplePeriod) => {
                return (
                  <ListItem
                    dense
                    divider
                    disableGutters
                    sx={{
                      px: 1.5,
                      color: 'text.secondary'
                    }}
                    title="Sampling Period"
                    key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
                    <ListItemIcon sx={{ minWidth: '32px' }} color="inherit">
                      <Icon path={mdiCalendarRange} size={0.75}></Icon>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2" component="div" color="inherit">
                        {`${samplePeriod.start_date} ${samplePeriod.start_time ?? ''} - ${samplePeriod.end_date} ${
                          samplePeriod.end_time ?? ''
                        }`}
                      </Typography>
                    </ListItemText>
                  </ListItem>
                );
              })}
            </List>
          </ListItem>
        );
      })}
    </List>
  );
};

export default SamplingSiteMethodsPeriodsList;
