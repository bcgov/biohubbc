import { mdiArrowRightThin, mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { ISurveySampleMethodPeriodData } from 'features/surveys/components/MethodForm';
import { IGetSamplePeriodRecord } from 'interfaces/useSurveyApi.interface';

interface ISamplingPeriodsTimelineProps {
  samplePeriods: (IGetSamplePeriodRecord | ISurveySampleMethodPeriodData)[];
}

const SamplingPeriodsTimeline = (props: ISamplingPeriodsTimelineProps) => {
  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMM D, YYYY h:mm A' : 'MMM D, YYYY');

  const dateSx = {
    fontSize: '0.85rem',
    color: 'textSecondary'
  };

  const timeSx = {
    fontSize: '0.8rem',
    color: 'text.secondary'
  };

  return (
    <Timeline sx={{ alignItems: 'start', justifyContent: 'start', p: 0, my: 1, ml: 2, mr: 0 }}>
      {props.samplePeriods.length &&
        props.samplePeriods?.map((samplePeriod, index) => (
          <TimelineItem
            sx={{
              width: '100%',
              '&::before': {
                content: 'none'
              },
              minHeight: props.samplePeriods.length ? '40px' : 0,
              m: 0,
              p: 0
            }}
            key={samplePeriod.survey_sample_period_id}>
            <TimelineSeparator sx={{ minWidth: '11px' }}>
              {props.samplePeriods.length > 1 ? (
                <>
                  <TimelineDot sx={{ bgcolor: grey[400] }} />
                  {index < (props.samplePeriods?.length ?? 0) - 1 && (
                    <TimelineConnector
                      sx={{
                        bgcolor: grey[400],
                        position: 'absolute',
                        height: '85%',
                        top: 22,
                        opacity: 0.75
                      }}
                    />
                  )}
                </>
              ) : (
                <Box mt={1} display="flex" alignItems="center">
                  <Icon path={mdiCalendarRange} size={0.7} color={grey[500]} />
                </Box>
              )}
            </TimelineSeparator>
            <TimelineContent
              sx={{
                '& .MuiTimelineItem-root': {
                  width: '100%',
                  flex: '1 1 auto'
                }
              }}>
              <Box width="100%" display="flex" justifyContent="space-between">
                <Box>
                  <Typography component="dt" variant="subtitle2" sx={dateSx}>
                    {formatDate(samplePeriod.start_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" sx={timeSx}>
                    {samplePeriod.start_time}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', mx: 1 }}>
                  <Icon path={mdiArrowRightThin} size={0.9} color={grey[500]} />
                </Box>
                <Box flex="1 1 auto">
                  <Typography component="dt" variant="subtitle2" sx={dateSx}>
                    {formatDate(samplePeriod.end_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" sx={timeSx}>
                    {samplePeriod.end_time}
                  </Typography>
                </Box>
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
    </Timeline>
  );
};

export default SamplingPeriodsTimeline;
