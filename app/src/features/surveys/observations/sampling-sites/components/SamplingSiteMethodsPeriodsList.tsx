import { mdiArrowRightThin } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { colors, Grid, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { CodesContext } from 'contexts/codesContext';
import dayjs from 'dayjs';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect } from 'react';
import { getCodesName } from 'utils/Utils';
import { IStratumChipColours } from '../SamplingSiteList';
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

  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMMM D, YYYY h:mm A' : 'MMMM D, YYYY');

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
            <Timeline sx={{ alignItems: 'start', justifyContent: 'start' }}>
              {/* <List disablePadding> */}
              {sampleMethod.sample_periods?.map((samplePeriod, index) => {
                return (
                  <TimelineItem
                    sx={{
                      width: '100%',
                      '&::before': {
                        content: 'none'
                      },
                      minHeight: '50px',
                      m: 0,
                      p: 0
                    }}
                    key={samplePeriod.survey_sample_period_id}>
                    <TimelineSeparator>
                      <TimelineDot />
                      {index < (sampleMethod.sample_periods?.length ?? 0) - 1 && (
                        <TimelineConnector
                          sx={{
                            position: 'absolute',
                            height: '100%',
                            top: 15,
                            opacity: 0.75
                          }}
                        />
                      )}
                    </TimelineSeparator>
                    <TimelineContent
                      sx={{
                        '& .MuiTimelineItem-root': {
                          width: '100%',
                          flex: '1 1 auto'
                        }
                      }}>
                      <Grid container xs={12} width="100%">
                        <Grid item xs={5} flex="1 1 auto">
                          <Typography variant="body2" component="div" fontWeight={700} color="textSecondary">
                            {formatDate(samplePeriod.start_date as unknown as Date, false)}
                          </Typography>
                          <Typography variant="body2" component="div" fontWeight={500} color="textSecondary">
                            {samplePeriod.start_time}
                          </Typography>
                        </Grid>
                        <Grid item flex="0.5 1 auto" alignItems="start">
                          <Icon path={mdiArrowRightThin} size={0.8} color={grey[400]} />
                        </Grid>
                        <Grid item xs={5} flex="1 1 auto">
                          <Typography variant="body2" component="div" fontWeight={700} color="textSecondary">
                            {formatDate(samplePeriod.end_date as unknown as Date, false)}
                          </Typography>
                          <Typography variant="body2" component="div" fontWeight={500} color="textSecondary">
                            {samplePeriod.end_time}
                          </Typography>
                        </Grid>
                      </Grid>
                    </TimelineContent>
                  </TimelineItem>

                  // <ListItem
                  //   dense
                  //   divider
                  //   disableGutters
                  //   sx={{
                  //     py: 1,
                  //     px: 3,
                  //     color: 'text.secondary'
                  //   }}
                  //   title="Sampling Period"
                  //   key={`${samplePeriod.survey_sample_method_id}-${samplePeriod.survey_sample_period_id}`}>
                  //   <ListItemIcon sx={{ minWidth: '25px', mt: '1px' }} color="inherit">
                  //     <Icon path={mdiCalendarRange} size={0.75} />
                  //   </ListItemIcon>
                  //   <ListItemText>
                  // <Typography variant="body2" component="div" color="inherit" fontWeight={500}>
                  //   {`${formatDate(
                  //     [samplePeriod.start_date, samplePeriod.start_time].join('T') as unknown as Date,
                  //     samplePeriod.start_time != null
                  //   )} - ${formatDate(
                  //     [samplePeriod.end_date, samplePeriod.end_time].join('T') as unknown as Date,
                  //     samplePeriod.start_time != null
                  //   )}`}
                  // </Typography>
                  //   </ListItemText>
                  // </ListItem>
                );
              })}
              {/* </List> */}
            </Timeline>
          </ListItem>
        );
      })}
    </List>
  );
};

export default SamplingSiteMethodsPeriodsList;
