import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment, useState } from 'react';
import { v4 } from 'uuid';
import { AnimalMortalitySchema, getAnimalFieldName, IAnimal, IAnimalMortality, isRequiredInSchema } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';
import LocationEntryForm from './LocationEntryForm';

/**
 * Renders the Mortality section for the Individual Animal form
 *
 * Note A: Using <FieldArray/> the name properties must stay in sync with
 * values object and nested arrays.
 * ie: values = { mortality: [{id: 'test'}] };  name = 'mortality.[0].id';
 *
 * Note B: FormSectionWrapper uses a Grid container to render children elements.
 * Children of FormSectionWrapper can use Grid items to organize inputs.
 *
 * Note C: Mortality gets set like an array here, though it should only ever contain one value.
 * This might seem odd, but this is in line with how critterbase stores these values.
 * To encourage the max of one rule, we use the maxSections prop here to prevent additional copies of the form
 * from rendering.
 *
 * @return {*}
 */

type ProjectionMode = 'wgs' | 'utm';
const MortalityAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();

  const name: keyof IAnimal = 'mortality';
  const newMortality: IAnimalMortality = {
    _id: v4(),

    mortality_longitude: '' as unknown as number,
    mortality_latitude: '' as unknown as number,
    mortality_utm_northing: '' as unknown as number,
    mortality_utm_easting: '' as unknown as number,
    mortality_timestamp: '' as unknown as Date,
    mortality_coordinate_uncertainty: 10,
    mortality_comment: '',
    proximate_cause_of_death_id: '',
    proximate_cause_of_death_confidence: '',
    proximate_predated_by_taxon_id: '',
    ultimate_cause_of_death_id: '',
    ultimate_cause_of_death_confidence: '',
    ultimate_predated_by_taxon_id: '',
    projection_mode: 'wgs' as ProjectionMode,
    mortality_id: undefined,
    location_id: undefined
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMortalityTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalMortalityTitle2}
            titleHelp={SurveyAnimalsI18N.animalMortalityHelp}
            btnLabel={SurveyAnimalsI18N.animalMortalityAddBtn}
            maxSections={1}
            handleAddSection={() => push(newMortality)}
            handleRemoveSection={remove}>
            {values.mortality.map((mort, index) => (
              <MortalityAnimalFormContent key={mort._id} name={name} index={index} value={mort} />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface MortalityAnimalFormContentProps {
  name: keyof IAnimal;
  index: number;
  value: IAnimalMortality;
}

const MortalityAnimalFormContent = ({ name, index, value }: MortalityAnimalFormContentProps) => {
  const { handleBlur } = useFormikContext<IAnimal>();

  const [pcodTaxonDisabled, setPcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the PCOD Taxon dropdown.
  const [ucodTaxonDisabled, setUcodTaxonDisabled] = useState(true); //Controls whether you can select taxons from the UCOD Taxon dropdown.
  const [showMortalityComment, setShowMortalityComment] = useState(false);

  const renderFields = (): JSX.Element => {
    return (
      <Fragment key={'mortality-fields'}>
        <Grid item xs={6}>
          <SingleDateField
            name={getAnimalFieldName<IAnimalMortality>(name, 'mortality_timestamp', index)}
            required={isRequiredInSchema(AnimalMortalitySchema, 'mortality_timestamp')}
            label={'Mortality Date'}
            other={{ size: 'small' }}
          />
        </Grid>
        <Grid item xs={5}>
          <CbSelectField
            name={getAnimalFieldName<IAnimalMortality>(name, 'proximate_cause_of_death_id', index)}
            handleChangeSideEffect={(_value, label) => setPcodTaxonDisabled(!label.includes('Predation'))}
            label={'PCOD Reason'}
            controlProps={{
              size: 'small',
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
              size: 'small',
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
              size: 'small',
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
              size: 'small',
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
              size: 'small',
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
              size: 'small',
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
                size: 'small'
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

export default MortalityAnimalForm;
