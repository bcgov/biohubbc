import { mdiArrowRightThin, mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import { IObservationsContext } from 'contexts/observationsContext';
import { IObservationsPageContext } from 'contexts/observationsPageContext';
import dayjs from 'dayjs';
import { ImportObservationsButton } from 'features/surveys/observations/components/ImportObservationsButton';
import { GetSamplingPeriod } from 'interfaces/useSamplingPeriodApi.interface';

interface ISamplingSiteListPeriodProps {
  samplePeriods: GetSamplingPeriod[];
  observationsPageContext?: IObservationsPageContext;
  observationsContext?: IObservationsContext;
}
/**
 * Renders a timeline of sampling period dates.
 *
 * Includes an import observations button if the observationsPageContext and observationsContext are provided.
 *
 * @param props {ISamplingSiteListPeriodProps}
 * @returns
 */
export const SamplingSiteListPeriod = (props: ISamplingSiteListPeriodProps) => {
  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY');

  const { samplePeriods, observationsPageContext, observationsContext } = props;

  const dateSx = {
    fontSize: '0.85rem',
    color: 'textSecondary'
  };

  const timeSx = {
    fontSize: '0.85rem',
    color: 'text.secondary'
  };

  const sortedSamplePeriods = samplePeriods.sort((a, b) => {
    if (!a.start_date && !b.start_date) {
      return 0;
    }

    if (!a.start_date) {
      return -1;
    }

    if (!b.start_date) {
      return 1;
    }

    const startDateA = new Date(a.start_date);
    const startDateB = new Date(b.start_date);

    if (startDateA === startDateB) {
      if (a.start_time && b.start_time) {
        return a.start_time < b.start_time ? 1 : -1;
      }
      return a.start_time ? -1 : 1;
    }

    return startDateA < startDateB ? -1 : 1;
  });

  return (
    <Timeline title="Sampling Period" sx={{ alignItems: 'start', justifyContent: 'start', p: 0, m: 0 }}>
      {sortedSamplePeriods.map((samplePeriod, index) => (
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
          key={`sample-period-${samplePeriod.survey_sample_period_id}`}>
          <TimelineSeparator sx={{ minWidth: 0, ml: 1, mr: 0.5 }}>
            {samplePeriods.length > 1 ? (
              <Box display="flex" justifyContent="center">
                <TimelineDot sx={{ bgcolor: grey[400], boxShadow: 'none' }} />
                {index < samplePeriods.length - 1 && (
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
              pr: 0,
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
                    surveySamplePeriodId={samplePeriod.survey_sample_period_id}
                    buttonProps={{
                      size: 'small',
                      sx: {
                        borderRadius: '3px',
                        fontSize: '0.6rem'
                      }
                    }}
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
