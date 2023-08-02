import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React, { Fragment } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMeasurement } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';
const MeasurementAnimalForm = () => {
  const { values } = useFormikContext<IAnimal>();
  const name: keyof IAnimal = 'measurement';
  const newMeasurement: IAnimalMeasurement = {
    measurement_type_id: '',
    measurement_value: '',
    measurement_unit_id: '',
    measurement_comment: ''
  };

  return (
    <FieldArray name={name}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMeasurementTitle}
            titleHelp={SurveyAnimalsI18N.animalMeasurementHelp}
            btnLabel={SurveyAnimalsI18N.animalMeasurementAddBtn}
            handleAddSection={() => push(newMeasurement)}
            handleRemoveSection={remove}>
            {values.measurement.map((_cap, index) => (
              <Fragment key={`marking-inputs-${index}`}>
                <Grid item xs={6}>
                  <CbSelectField
                    label="Measurement Type"
                    name={getAnimalFieldName<IAnimalMeasurement>(name, 'measurement_type_id', index)}
                    id="measurement_type"
                    route="taxon_quantitative_measurements"
                    taxon_id={values.general.taxon_id}
                    controlProps={{ size: 'small', required: true }}
                  />
                </Grid>
                <Grid item xs={4}>
                  <CbSelectField
                    label="Measurement Value"
                    name={getAnimalFieldName<IAnimalMeasurement>(name, 'measurement_value', index)}
                    id="measurement_value"
                    route="colours"
                    controlProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <CbSelectField
                    label="Unit"
                    name={getAnimalFieldName<IAnimalMeasurement>(name, 'measurement_unit_id', index)}
                    id="measurement_unit"
                    route="colours"
                    controlProps={{ size: 'small' }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Measurement')}>
                    <CustomTextField
                      other={{ size: 'small' }}
                      label="Measurment Comment"
                      name={getAnimalFieldName<IAnimalMeasurement>(name, 'measurement_comment', index)}
                    />
                  </TextInputToggle>
                </Grid>
              </Fragment>
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

export default MeasurementAnimalForm;
