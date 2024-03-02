import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { useFormikContext } from 'formik';
import { useState } from 'react';
import { AnimalMortalitySchema, getAnimalFieldName, IAnimal, IAnimalMortality, isRequiredInSchema } from '../animal';
import LocationEntryForm from './LocationEntryForm';

interface MortalityAnimalFormContentProps {
  index: number;
}

export const MortalityAnimalFormContent = ({ index }: MortalityAnimalFormContentProps) => {
  const name: keyof IAnimal = 'mortality';

  const { values } = useFormikContext<IAnimal>();
  const [pcodTaxonDisabled, setPcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the PCOD Taxon dropdown.
  const [ucodTaxonDisabled, setUcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the UCOD Taxon dropdown.

  const value = values.mortality[index];

  return (
    <Stack gap={4}>
      <Box component="fieldset">
        <Typography component="legend">Date of Event</Typography>
        <SingleDateField
          name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_timestamp', index)}
          required={isRequiredInSchema(AnimalMortalitySchema, 'mortality_timestamp')}
          label={'Mortality Date'}
          aria-label="Mortality Date"
        />
      </Box>

      <LocationEntryForm
        name={name}
        index={index}
        value={value}
        primaryLocationFields={{
          fieldsetTitle: 'Location',
          latitude: 'mortality_latitude',
          longitude: 'mortality_longitude',
          coordinate_uncertainty: 'mortality_coordinate_uncertainty',
          utm_northing: 'mortality_utm_northing',
          utm_easting: 'mortality_utm_easting'
        }}
      />

      <Box component="fieldset">
        <Typography component="legend">Proximate Cause of Death</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_cause_of_death_id', index)}
              handleChangeSideEffect={(_value, label) => setPcodTaxonDisabled(!label.includes('Predation'))}
              orderBy={'asc'}
              label={'Reason'}
              controlProps={{
                required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_cause_of_death_id')
              }}
              id={`${index}-pcod-reason`}
              route={'lookups/cods'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_cause_of_death_confidence', index)}
              label={'Confidence'}
              controlProps={{
                required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_cause_of_death_confidence')
              }}
              id={`${index}-pcod-confidence`}
              route={'lookups/enum/cod-confidence'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_predated_by_itis_tsn', index)}
              label={'Taxon'}
              controlProps={{
                disabled: pcodTaxonDisabled,
                required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_predated_by_itis_tsn')
              }}
              id={`${index}-pcod-taxon`}
              route={'lookups/taxons'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Ultimate Cause of Death</Typography>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_cause_of_death_id', index)}
              orderBy={'asc'}
              handleChangeSideEffect={(_value, label) => {
                setUcodTaxonDisabled(!label.includes('Predation'));
              }}
              label={'Reason'}
              controlProps={{
                required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_cause_of_death_id')
              }}
              id={`${index}-ucod-reason`}
              route={'lookups/cods'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_cause_of_death_confidence', index)}
              label={'Confidence'}
              controlProps={{
                required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_cause_of_death_confidence')
              }}
              id={`${index}-ucod-confidence`}
              route={'lookups/enum/cod-confidence'}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <CbSelectField
              name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_predated_by_itis_tsn', index)}
              label={'Taxon'}
              controlProps={{
                disabled: ucodTaxonDisabled,
                required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_predated_by_itis_tsn')
              }}
              id={`${index}-ucod-taxon`}
              route={'lookups/taxons'}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset">
        <Typography component="legend">Additional Details</Typography>
        <CustomTextField
          other={{
            required: isRequiredInSchema(AnimalMortalitySchema, 'mortality_comment'),
            multiline: true,
            minRows: 2
          }}
          label="Comments"
          name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_comment', index)}
        />
      </Box>
    </Stack>
  );
};

export default MortalityAnimalFormContent;
