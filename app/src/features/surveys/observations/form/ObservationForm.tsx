import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { TimeField } from 'components/fields/TimeField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IObservationTableRowToSave } from 'hooks/api/useObservationApi';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';
import { initialSubcountValues } from '../add/dialog/AddObservationDialog';
import SubcountForm from './subcounts/SubcountForm';

// Define the validation schema for each subcount
export const subcountValidationSchema = yup.object({
  observation_subcount_id: yup.number().nullable(),
  subcount: yup.number().required('A subcount is required.'),
  comment: yup.string().nullable(),

  qualitative_measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().required('Measurement ID is required.'),
      measurement_option_id: yup.string().required('Measurement Option ID is required.')
    })
  ),

  quantitative_measurements: yup.array().of(
    yup.object({
      measurement_id: yup.string().required('Measurement ID is required.'),
      measurement_value: yup.number().required('Measurement Value is required.')
    })
  ),

  qualitative_environments: yup.array().of(
    yup.object({
      environment_qualitative_id: yup.string().required('Qualitative Environment ID is required.'),
      environment_qualitative_option_id: yup.string().required('Qualitative Environment Option ID is required.')
    })
  ),

  quantitative_environments: yup.array().of(
    yup.object({
      environment_quantitative_id: yup.string().required('Quantitative Environment ID is required.'),
      value: yup.number().required('Quantitative Value is required.')
    })
  )
});

// Define the full validation schema for the observation
export const ObservationYupSchema = yup.object({
  standardColumns: yup.object({
    observation_subcount_id: yup.number().nullable(),
    itis_tsn: yup.number().required('A species or taxon is required.'),
    itis_scientific_name: yup.string().nullable(),
    survey_sample_site_id: yup.number().nullable(),
    survey_sample_method_id: yup.number().nullable(),
    survey_sample_period_id: yup.number().nullable(),
    count: yup.number().nullable().optional(),
    observation_date: yup.date().nullable(),
    observation_time: yup.string().nullable(),
    latitude: yup.number().nullable(),
    longitude: yup.number().nullable()
  }),
  subcounts: yup.array().of(subcountValidationSchema).required('At least one subcount is required.')
});

const ObservationForm = () => {
  const formikProps = useFormikContext<IObservationTableRowToSave>();
  const [showSamplingInformation, setShowSamplingInformation] = useState<boolean>(false);

  return (
    <form>
      <Box mb={2}>
        <SpeciesAutocompleteField
          formikFieldName={'standardsColumns.itis_tsn'}
          label={'Species'}
          required={true}
          handleSpecies={(species) => {
            if (species.tsn) {
              formikProps.setFieldValue('standardColumns.itis_tsn', species.tsn);
            }
          }}
          clearOnSelect={true}
        />
      </Box>

      <Stack direction="row" spacing={1} mb={2}>
        <SingleDateField label="Date" name="date" />
        <TimeField formikProps={formikProps} label="Time" name="time" id="longitude" required={false} />
      </Stack>

      <Stack direction="row" spacing={1} mb={2}>
        <CustomTextField label="Latitude" name="latitude" other={{ type: 'number' }} />
        <CustomTextField label="Longitude" name="longitude" other={{ type: 'number' }} />
      </Stack>

      <Box mb={5}>
        {showSamplingInformation ? (
          <Stack spacing={2}>
            <AutocompleteField id="survey_sample_site" name="survey_sample_site" label={'Site'} options={[]} />
            <AutocompleteField id="survey_sample_method" name="survey_sample_method" label={'Method'} options={[]} />
            <AutocompleteField id="survey_sample_period" name="survey_sample_period" label={'Period'} options={[]} />
          </Stack>
        ) : (
          <Button
            sx={{ mt: 2 }}
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add marking"
            onClick={() => {
              setShowSamplingInformation(true);
            }}>
            Add Sampling Site
          </Button>
        )}
      </Box>

      <FieldArray
        name="subcounts"
        render={(arrayHelpers: FieldArrayRenderProps) => {
          return (
            <>
              <Typography component="legend">Subcounts</Typography>
              <TransitionGroup>
                {formikProps.values.subcounts.map((subcount, index) => (
                  <Collapse key={subcount.observation_subcount_id || index}>
                    <Accordion
                      disableGutters
                      variant="outlined"
                      sx={{
                        mb: 1,
                        p: 1,
                        bgcolor: grey[100],
                        '& .Mui-focusVisible': { backgroundColor: 'rgba(0,0,0,0)' }
                      }}>
                      <AccordionSummary
                        sx={{
                          flex: '1 1 auto',
                          '& .Mui-expanded': { minHeight: 0 },
                          overflow: 'hidden',
                          '& .MuiAccordionSummary-content': {
                            flex: '1 1 auto',
                            py: 0,
                            pl: 0
                          }
                        }}>
                        <Box flex={0.2} display="flex" alignItems="center">
                          <CustomTextField
                            label="Subcount"
                            name="subcount"
                            other={{ type: 'number', sx: { position: 'relative', zIndex: 99 } }}
                          />
                        </Box>
                        <Box flex={0.8} display="flex" justifyContent="flex-end" alignItems="center">
                          <Icon path={mdiPlus} size={1} />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ mt: 2 }}>
                        <SubcountForm />
                      </AccordionDetails>
                    </Accordion>
                  </Collapse>
                ))}
              </TransitionGroup>

              <Button
                color="primary"
                sx={{ mt: 2 }}
                variant="outlined"
                startIcon={<Icon path={mdiPlus} size={1} />}
                aria-label="add marking"
                onClick={() => {
                  arrayHelpers.push(initialSubcountValues);
                }}>
                Add Subcount
              </Button>
            </>
          );
        }}
      />
    </form>
  );
};

export default ObservationForm;
