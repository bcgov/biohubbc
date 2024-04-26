import { mdiArrowRightThin, mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { IObservationsContext } from 'contexts/observationsContext';
import { IObservationsPageContext } from 'contexts/observationsPageContext';
import dayjs from 'dayjs';
import { ISurveySampleMethodPeriodData } from 'features/surveys/components/MethodForm';
import { IGetSamplePeriodRecord } from 'interfaces/useSurveyApi.interface';
import { ImportObservationsButton } from './import-observations/ImportObservationsButton';

interface ISamplingSiteListPeriodProps {
  samplePeriods: (IGetSamplePeriodRecord | ISurveySampleMethodPeriodData)[];
  observationsPageContext?: IObservationsPageContext;
  observationsContext?: IObservationsContext;
}
/**
 * Renders sampling periods for a sampling method
 * @param props {ISamplingSiteListPeriodProps}
 * @returns
 */
const SamplingSiteListPeriod = (props: ISamplingSiteListPeriodProps) => {
  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY');

  const { observationsPageContext, observationsContext } = props;

  const dateSx = {
    fontSize: '0.85rem',
    color: 'textSecondary'
  };

  const timeSx = {
    fontSize: '0.85rem',
    color: 'text.secondary'
  };

  return (
    <Timeline title="Sampling Period" sx={{ alignItems: 'start', justifyContent: 'start', p: 0, m: 0 }}>
      {props.samplePeriods
        .sort((a, b) => {
          const startDateA = new Date(a.start_date);
          const startDateB = new Date(b.start_date);

          if (startDateA === startDateB) {
            if (a.start_time && b.start_time) {
              if (a.start_time < b.start_time) return 1;
              if (a.start_time > b.start_time) return -1;
              return 0;
            }
            if (a.start_time && !b.start_time) {
              return -1;
            }
          }
          if (startDateA < startDateB) {
            return -1;
          }
          if (startDateA > startDateB) {
            return 1;
          }
          return 0;
        })
        .map((samplePeriod, index) => (
          <TimelineItem
            sx={{
              width: '100%',
              '&::before': {
                content: 'none'
              },
              minHeight: '40px',
              m: 0,
              p: 0
            }}
            key={`${samplePeriod.survey_sample_period_id}-${index}`}>
            <TimelineSeparator sx={{ minWidth: 0, ml: 1, mr: 0.5 }}>
              {props.samplePeriods.length > 1 ? (
                <Box display="flex" justifyContent="center">
                  <TimelineDot sx={{ bgcolor: grey[400], boxShadow: 'none' }} />
                  {index < props.samplePeriods.length - 1 && (
                    <TimelineConnector
                      sx={{
                        bgcolor: grey[400],
                        position: 'absolute',
                        height: '85%',
                        top: 20
                      }}
                    />
                  )}
                </Box>
              ) : (
                <Box mt={1}>
                  <Icon path={mdiCalendarRange} size={0.75} color={grey[500]} />
                </Box>
              )}
            </TimelineSeparator>
            <TimelineContent
              sx={{
                '& .MuiTimelineItem-root': {
                  width: '100%',
                  flex: '1 1 auto'
                },
                '& .MuiTypography-root': {
                  m: 0
                }
              }}>
              <Box width="100%" display="flex" justifyContent="space-between" p={0}>
                <Box>
                  <Typography component="dt" variant="subtitle2" sx={dateSx}>
                    {formatDate(samplePeriod.start_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" sx={timeSx}>
                    {samplePeriod.start_time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mx: 1, mt: -0.25 }}>
                  <Icon path={mdiArrowRightThin} size={1} color={grey[500]} />
                </Box>
                <Box flex="1 1 auto">
                  <Typography component="dt" variant="subtitle2" sx={dateSx}>
                    {formatDate(samplePeriod.end_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" sx={timeSx}>
                    {samplePeriod.end_time}
                  </Typography>
                </Box>
                {observationsPageContext && observationsContext && samplePeriod?.survey_sample_period_id && (
                  <Box mt={-0.25}>
                    <ImportObservationsButton
                      disabled={observationsPageContext.isDisabled}
                      onStart={() => {
                        observationsPageContext.setIsDisabled(true);
                        observationsPageContext.setIsLoading(true);
                      }}
                      onSuccess={() => {
                        observationsContext.observationsDataLoader.refresh();
                      }}
                      onFinish={() => {
                        observationsPageContext.setIsDisabled(false);
                        observationsPageContext.setIsLoading(false);
                      }}
                      processOptions={{ surveySamplePeriodId: samplePeriod.survey_sample_period_id }}
                    />
                  </Box>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
    </Timeline>
  );
};

export default SamplingSiteListPeriod;
