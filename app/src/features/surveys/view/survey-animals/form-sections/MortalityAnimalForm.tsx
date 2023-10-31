import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { useFormikContext } from 'formik';
import { Fragment, useState } from 'react';
import { AnimalMortalitySchema, getAnimalFieldName, IAnimal, IAnimalMortality, isRequiredInSchema } from '../animal';
import TextInputToggle from '../TextInputToggle';
import LocationEntryForm from './LocationEntryForm';

interface MortalityAnimalFormContentProps {
  index: number;
}

export const MortalityAnimalFormContent = ({ index }: MortalityAnimalFormContentProps) => {
  const name: keyof IAnimal = 'mortality';

  const { values, handleBlur } = useFormikContext<IAnimal>();
  const [pcodTaxonDisabled, setPcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the PCOD Taxon dropdown.
  const [ucodTaxonDisabled, setUcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the UCOD Taxon dropdown.
  const [showMortalityComment, setShowMortalityComment] = useState(false);

  const value = values.mortality[index];

  const renderFields = (): JSX.Element => {
    return (
      <Fragment key={'mortality-fields'}>
        <Grid item xs={12} md={6}>
          <SingleDateField
            name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_timestamp', index)}
            required={isRequiredInSchema(AnimalMortalitySchema, 'mortality_timestamp')}
            label={'Mortality Date'}
            other={{ size: 'medium' }}
          />
        </Grid>
        <Grid item xs={5}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_cause_of_death_id', index)}
            handleChangeSideEffect={(_value, label) => setPcodTaxonDisabled(!label.includes('Predation'))}
            label={'PCOD Reason'}
            controlProps={{
              size: 'medium',
              required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_cause_of_death_id')
            }}
            id={`${index}-pcod-reason`}
            route={'lookups/cods'}
          />
        </Grid>
        <Grid item xs={4}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_cause_of_death_confidence', index)}
            label={'PCOD Confidence'}
            controlProps={{
              size: 'medium',
              required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_cause_of_death_confidence')
            }}
            id={`${index}-pcod-confidence`}
            route={'lookups/cause-of-death-confidence'}
          />
        </Grid>
        <Grid item xs={3}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_predated_by_taxon_id', index)}
            label={'PCOD Taxon'}
            controlProps={{
              size: 'medium',
              disabled: pcodTaxonDisabled,
              required: isRequiredInSchema(AnimalMortalitySchema, 'proximate_predated_by_taxon_id')
            }}
            id={`${index}-pcod-taxon`}
            route={'lookups/taxons'}
          />
        </Grid>
        <Grid item xs={5}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_cause_of_death_id', index)}
            handleChangeSideEffect={(_value, label) => {
              setUcodTaxonDisabled(!label.includes('Predation'));
            }}
            label={'UCOD Reason'}
            controlProps={{
              size: 'medium',
              required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_cause_of_death_id')
            }}
            id={`${index}-ucod-reason`}
            route={'lookups/cods'}
          />
        </Grid>
        <Grid item xs={4}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_cause_of_death_confidence', index)}
            label={'UCOD Confidence'}
            controlProps={{
              size: 'medium',
              required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_cause_of_death_confidence')
            }}
            id={`${index}-ucod-confidence`}
            route={'lookups/cause-of-death-confidence'}
          />
        </Grid>
        <Grid item xs={3}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'ultimate_predated_by_taxon_id', index)}
            label={'UCOD Taxon'}
            controlProps={{
              size: 'medium',
              disabled: ucodTaxonDisabled,
              required: isRequiredInSchema(AnimalMortalitySchema, 'ultimate_predated_by_taxon_id')
            }}
            id={`${index}-ucod-taxon`}
            route={'lookups/taxons'}
          />
        </Grid>
        <Grid item xs={12}>
          <TextInputToggle
            label="Add comment about this Mortality"
            toggleProps={{ handleToggle: () => setShowMortalityComment((c) => !c), toggleState: showMortalityComment }}>
            <CustomTextField
              other={{
                required: isRequiredInSchema(AnimalMortalitySchema, 'mortality_comment'),
                size: 'medium'
              }}
              label="Mortality Comment"
              name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_comment', index)}
              handleBlur={handleBlur}
            />
          </TextInputToggle>
        </Grid>
      </Fragment>
    );
  };

  return (
    <>
      <LocationEntryForm
        name={name}
        index={index}
        value={value}
        primaryLocationFields={{
          latitude: 'mortality_latitude',
          longitude: 'mortality_longitude',
          coordinate_uncertainty: 'mortality_coordinate_uncertainty',
          utm_northing: 'mortality_utm_northing',
          utm_easting: 'mortality_utm_easting'
        }}
        otherPrimaryFields={[renderFields()]}
      />
    </>
  );
};

export default MortalityAnimalFormContent;
