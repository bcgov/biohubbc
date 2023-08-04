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
  const { values } = useFormikContext<IAnimal>();

  const { data: quantData, load } = useDataLoader(async () =>
    api.lookup.getSelectOptions<ICbSelectRows>({
      route: 'taxon_quantitative_measurements',
      query: `taxon_id=${values.general.taxon_id}`,
      asSelect: false
    })
  );

  const canLoadData = !quantData && values.measurement.length > 0 && values.general.taxon_id;

  if (canLoadData) {
    load();
  }

  const newMeasurement: IAnimalMeasurement = {
    taxon_measurement_id: '',
    value: '' as unknown as number,
    option_id: '',
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
              <MeasurementFormContent
                key={`measurement-form-${index}`}
                index={index}
                quantitativeMeasurements={quantData}
              />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface MeasurementFormContentProps {
  index: number;
  quantitativeMeasurements?: ICbSelectRows[];
}

const MeasurementFormContent = ({ index, quantitativeMeasurements }: MeasurementFormContentProps) => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();
  const taxonMeasurementId = values.measurement[index].taxon_measurement_id;

  useEffect(() => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>(NAME, 'value', index), '');
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>(NAME, 'option_id', index), '');
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
        {taxonMeasurementId && quantitativeMeasurements?.some((q) => q.id === taxonMeasurementId) ? (
          <CbSelectField
            label="Measurement Option"
            name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'option_id', index)}
            id="qualitative_option"
            route="taxon_qualitative_measurement_options"
            query={`taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{ size: 'small', disabled: !taxonMeasurementId }}
          />
        ) : (
            <CustomTextField
              label="Measurement Value"
              name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'value', index)}
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
