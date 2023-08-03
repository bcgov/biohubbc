import { Grid } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICbSelectRows } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import React, { Fragment, useEffect } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMeasurement } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const NAME: keyof IAnimal = 'measurement';

const MeasurementAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values, errors } = useFormikContext<IAnimal>();
  console.log(errors);

  const { data: qualData, load } = useDataLoader(async () =>
    api.lookup.getSelectOptions<ICbSelectRows>(
      'taxon_qualitative_measurements',
      undefined,
      `taxon_id=${values.general.taxon_id}`
    )
  );

  const canLoadData = !qualData && values.measurement.length > 0 && values.general.taxon_id;

  if (canLoadData) {
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
              <MeasurementFormContent index={index} qualitativeMeasurements={qualData} />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface MeasurementFormContentProps {
  index: number;
  qualitativeMeasurements?: ICbSelectRows[];
}

const MeasurementFormContent = ({ index, qualitativeMeasurements }: MeasurementFormContentProps) => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();
  const taxonMeasurementId = values.measurement[index].taxon_measurement_id;

  useEffect(() => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>(NAME, 'valueOrOption', index), '');
  }, [taxonMeasurementId]);

  return (
    <Fragment key={`marking-inputs-${index}`}>
      <Grid item xs={6}>
        <CbSelectField
          label="Measurement Type"
          name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'taxon_measurement_id', index)}
          id="taxon_measurement_type"
          route="taxon_measurements"
          query={values.general.taxon_id && `taxon_id=${values.general.taxon_id}`}
          controlProps={{ size: 'small', required: true }}
        />
      </Grid>
      <Grid item xs={4}>
        {!qualitativeMeasurements?.some((q) => q.id === taxonMeasurementId) ? (
          <CbSelectField
            label="Measurement Option"
            name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'valueOrOption', index)}
            id="qualitative_option"
            route="taxon_qualitative_measurement_options"
            query={taxonMeasurementId && `taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{ size: 'small', disabled: !taxonMeasurementId }}
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
  );
};

export default MeasurementAnimalForm;
