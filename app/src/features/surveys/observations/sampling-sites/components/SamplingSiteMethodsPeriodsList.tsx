import { mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import { CodesContext } from 'contexts/codesContext';
import dayjs from 'dayjs';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import SamplingSiteMethodResponseMetricChip from './SamplingSiteMethodResponseMetricChip';

interface ISamplingSiteMethodsPeriodsListProps {
  sampleSite: IGetSampleLocationDetails;
}

const SamplingSiteMethodsPeriodsList = (props: ISamplingSiteMethodsPeriodsListProps) => {
  const codesContext = useContext(CodesContext);

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY');

  return (
    <List
      disablePadding
      sx={{
        '& .MuiListItemText-primary': {
          typography: 'body2',
          fontWeight: 700
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
              },
              justifyContent: 'flex-start'
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
              <SamplingSiteMethodResponseMetricChip method_response_metric_id={sampleMethod.method_response_metric_id} />
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
                    <ListItemIcon sx={{ minWidth: '25px' }} color="inherit">
                      <Icon path={mdiCalendarRange} size={0.7}></Icon>
                    </ListItemIcon>
                    <ListItemText>
                      <Typography variant="body2" component="div" color="inherit">
                        {`${formatDate(
                          [samplePeriod.start_date, samplePeriod.start_time].join('T') as unknown as Date,
                          samplePeriod.start_time != null
                        )} - ${formatDate(
                          [samplePeriod.end_date, samplePeriod.end_time].join('T') as unknown as Date,
                          samplePeriod.start_time != null
                        )}`}
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
