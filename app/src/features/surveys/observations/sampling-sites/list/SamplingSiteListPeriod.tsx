import { mdiArrowRightThin, mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineSeparator } from '@mui/lab';
import { Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { Box } from '@mui/system';
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
    <Timeline sx={{ alignItems: 'start', justifyContent: 'start', p: 0, my: 1, ml: 2, mr: 0 }}>
      {props.samplePeriods.map((samplePeriod, index) => (
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
          <TimelineSeparator sx={{ minWidth: '11px' }}>
            {props.samplePeriods.length > 1 ? (
              <>
                <TimelineDot sx={{ bgcolor: grey[400] }} />
                {index < props.samplePeriods.length - 1 && (
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
              <Box mt={1}>
                <Icon path={mdiCalendarRange} size={0.8} color={grey[500]} />
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
              {observationsPageContext && observationsContext && samplePeriod?.survey_sample_period_id && (
                <Box ml={2}>
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
              </Box>)}
            </Box>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
};

export default SamplingSiteListPeriod;
