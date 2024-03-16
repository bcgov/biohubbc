import { mdiArrowRightThin } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Grid, Theme, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import dayjs from 'dayjs';
import { IGetSamplePeriodRecord } from 'interfaces/useSurveyApi.interface';

interface ISamplingPeriodsTimelineProps {
  samplePeriods: IGetSamplePeriodRecord[];
}

const useStyles = makeStyles((theme: Theme) => ({
  typographyDate: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    fontWeight: 700
  },
  typographyTime: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary
  }
}));

const SamplingPeriodsTimeline = (props: ISamplingPeriodsTimelineProps) => {
  const formatDate = (dt: Date, time: boolean) => dayjs(dt).format(time ? 'MMMM D, YYYY h:mm A' : 'MMMM D, YYYY');
  const classes = useStyles();

  return (
    <Timeline sx={{ alignItems: 'start', justifyContent: 'start' }}>
      {props.samplePeriods?.map((samplePeriod, index) => {
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
                  <Typography component="dt" variant="subtitle2" className={classes.typographyDate}>
                    {formatDate(samplePeriod.start_date as unknown as Date, false)}
                  </Typography>
                  <Typography component="dt" variant="subtitle2" className={classes.typographyTime}>
                    {samplePeriod.start_time}
                  </Typography>
                </Grid>
                <Grid item flex="0.5 1 auto">
                  <Icon path={mdiArrowRightThin} size={0.8} color={grey[400]} />
                </Grid>
                <Grid item xs={5} flex="1 1 auto">
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
        );
      })}
    </Timeline>
  );
};

export default SamplingPeriodsTimeline;
