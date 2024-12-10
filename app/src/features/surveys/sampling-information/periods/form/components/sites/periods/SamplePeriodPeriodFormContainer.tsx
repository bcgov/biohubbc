import { mdiMinusCircleOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { FieldArray, FieldArrayRenderProps } from 'formik';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { v4 } from 'uuid';
import { InitialSurveySamplePeriodValues, SamplePeriodPeriodForm } from './SamplePeriodPeriodForm';

interface SamplePeriodPeriodFormContainerProps {
  formikFieldName: string;
  site: Pick<IGetSampleLocationNonSpatialDetails, 'survey_sample_site_id' | 'name'>;
  index: number;
  samplePeriods: any[];
  handleRemoveSite?: (index: number) => void;
  disableAdd?: boolean;
}

export const SamplePeriodPeriodFormContainer = (props: SamplePeriodPeriodFormContainerProps) => {
  const { formikFieldName, site, index, samplePeriods, handleRemoveSite, disableAdd } = props;

  return (
    <Paper variant="outlined" key={site.survey_sample_site_id} sx={{ mt: 2 }}>
      <ListItem
        alignItems="flex-start"
        disablePadding
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          p: 2,
          px: 3,
          mb: 2
        }}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center" mb={1}>
          <ListItemText
            primary={
              <Typography fontWeight={700} variant="subtitle1">
                {site.name}
              </Typography>
            }
          />
          {handleRemoveSite && (
            <IconButton
              color="error"
              onClick={() => {
                handleRemoveSite(index);
              }}>
              <Icon path={mdiMinusCircleOutline} size={1} />
            </IconButton>
          )}
        </Box>

        {/* Show periods if the site is expanded */}
        <Box width="100%">
          <FieldArray
            name={formikFieldName}
            render={(arrayHelpers: FieldArrayRenderProps) => (
              <>
                <SamplePeriodPeriodForm
                  index={index}
                  formikFieldName={formikFieldName}
                  samplePeriods={samplePeriods}
                  handleRemove={handleRemoveSite ? (index: number) => arrayHelpers.remove(index) : undefined}
                />

                {/* Add Period Button */}
                {disableAdd && (
                  <Button
                    sx={{
                      alignSelf: 'flex-start',
                      mt: 3
                    }}
                    data-testid="sampling-period-add-button"
                    variant="outlined"
                    color="primary"
                    title="Add Period"
                    aria-label="Create Sample Period"
                    startIcon={<Icon path={mdiPlus} size={1} />}
                    onClick={() =>
                      arrayHelpers.push({
                        ...InitialSurveySamplePeriodValues,
                        // Temporary id used as the unique key on the frontend, not to be sent to the backend
                        id: v4()
                      })
                    }>
                    Add Period
                  </Button>
                )}
              </>
            )}
          />
        </Box>
      </ListItem>
    </Paper>
  );
};

export default SamplePeriodPeriodFormContainer;
