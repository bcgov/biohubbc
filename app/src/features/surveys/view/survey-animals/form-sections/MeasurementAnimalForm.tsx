import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICbSelectRows } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { Fragment } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMeasurement } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const NAME: keyof IAnimal = 'measurement';

const MeasurementAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();

  const { data: qualData, load } = useDataLoader(async () =>
    api.lookup.getSelectOptions<ICbSelectRows>('taxon_qualitative_measurements', values.general.taxon_id)
  );

  if (!qualData && values.measurement.length > 0) {
    load();
  }

  const newMeasurement: IAnimalMeasurement = {
    taxon_measurement_id: '',
    valueOrOption: '',
    measured_timestamp: '' as unknown as Date,
    measurement_comment: ''
  };

  return (
    <FieldArray name={NAME}>
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
                    name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'taxon_measurement_id', index)}
                    id="taxon_measurement_type"
                    route="taxon_measurements"
                    query={`taxon_id=${values.general.taxon_id}`}
                    controlProps={{ size: 'small', required: true }}
                  />
                </Grid>
                <Grid item xs={4}>
                  {!qualData?.some((q) => q.id === values.measurement[index].taxon_measurement_id) ? (
                    <CbSelectField
                      label="Measurement Option"
                      name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'valueOrOption', index)}
                      id="qualitative_option"
                      route="taxon_qualitative_measurement_options"
                      query={`taxon_measurement_id=${values.measurement[index].taxon_measurement_id}`}
                      controlProps={{ size: 'small', disabled: true }}
                    />
                  ) : (
                    <CustomTextField
                      label="Measurement Value"
                      name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'valueOrOption', index)}
                      other={{ required: true, size: 'small' }}
                    />
                  )}
                </Grid>
                <Grid item xs={6}>
                  <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Measurement')}>
                    <CustomTextField
                      other={{ size: 'small' }}
                      label="Measurment Comment"
                      name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'measurement_comment', index)}
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
