import { mdiCalendarRange } from '@mdi/js';
import Icon from '@mdi/react';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { ImportObservationsButton } from 'features/surveys/observations/components/import-observations/ImportObservationsButton';
import { useObservationsPageContext } from 'hooks/useContext';
import { IGetSamplePeriodRecord } from 'interfaces/useSurveyApi.interface';

export interface ISamplingSiteListPeriodProps {
  samplePeriod: IGetSamplePeriodRecord;
}

export const SamplingSiteListPeriod = (props: ISamplingSiteListPeriodProps) => {
  const { samplePeriod } = props;

  const observationsPageContext = useObservationsPageContext();

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
      <ImportObservationsButton
        disabled={observationsPageContext.isDisabled}
        onStart={() => {
          observationsPageContext.setIsDisabled(true);
          observationsPageContext.setIsLoading(true);
        }}
        onFinish={() => {
          observationsPageContext.setIsDisabled(false);
          observationsPageContext.setIsLoading(false);
        }}
        processOptions={{ surveySamplePeriodId: samplePeriod.survey_sample_period_id }}
      />
    </ListItem>
  );
};
