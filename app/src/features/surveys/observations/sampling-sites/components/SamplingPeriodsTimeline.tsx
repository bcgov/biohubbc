import { mdiArrowRightThin, mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Grid, Theme, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { Box } from '@mui/system';
import dayjs from 'dayjs';
import { ISurveySampleMethodPeriodData } from 'features/surveys/components/MethodForm';
import { IGetSamplePeriodRecord } from 'interfaces/useSurveyApi.interface';

interface ISamplingPeriodsTimelineProps {
  samplePeriods: (IGetSamplePeriodRecord | ISurveySampleMethodPeriodData)[];
}

const useStyles = makeStyles((theme: Theme) => ({
  typographyDate: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    fontWeight: 700
  },
  typographyTime: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary
  }
}));

const SamplingPeriodsTimeline = (props: ISamplingPeriodsTimelineProps) => {
  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMMM D, YYYY h:mm A' : 'MMMM D, YYYY');
  const classes = useStyles();

  return (
    <Timeline sx={{ alignItems: 'start', justifyContent: 'start', p: 0, my: 1, mx: 2 }}>
      {props.samplePeriods.length &&
        props.samplePeriods?.map((samplePeriod, index) => (
          <TimelineItem
            sx={{
              width: '100%',
              '&::before': {
                content: 'none'
              },
              minHeight: props.samplePeriods.length ? '60px' : 0,
              m: 0,
              p: 0
            }}
            key={samplePeriod.survey_sample_period_id}>
            <TimelineSeparator>
              {props.samplePeriods.length > 1 ? (
                <>
                  <TimelineDot sx={{ bgcolor: grey[300] }} />
                  {index < (props.samplePeriods?.length ?? 0) - 1 && (
                    <TimelineConnector
                      sx={{
                        bgcolor: grey[300],
                        position: 'absolute',
                        height: '100%',
                        top: 15,
                        opacity: 0.75
                      }}
                    />
                  )}
                </>
              ) : (
                <Box sx={{ mt: 1, mx: 0, p: 0 }}>
                  <Icon path={mdiCalendarRange} size={0.7} color={grey[400]} />
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
              <Grid container xs={12} width="100%">
                <Grid item xs={5}>
                  <Typography component="dt" variant="subtitle2" className={classes.typographyDate}>
                    {formatDate(samplePeriod.start_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" className={classes.typographyTime}>
                    {samplePeriod.start_time}
                  </Typography>
                </Grid>
                <Grid item xs={2} flex="0.5 1 auto">
                  <Icon path={mdiArrowRightThin} size={0.9} color={grey[500]} />
                </Grid>
                <Grid item flex="1 1 auto">
                  <Typography component="dt" variant="subtitle2" className={classes.typographyDate}>
                    {formatDate(samplePeriod.end_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" className={classes.typographyTime}>
                    {samplePeriod.end_time}
                  </Typography>
                </Grid>
              </Grid>
            </TimelineContent>
          </TimelineItem>
        ))}
    </Timeline>
  );
};

export default SamplingPeriodsTimeline;
