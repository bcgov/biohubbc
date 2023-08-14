import { Grid, MenuItem } from '@mui/material';
import CbSelectField, { FormikSelectWrapper } from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IMeasurementStub } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { has } from 'lodash-es';
import React, { Fragment, useEffect, useState } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMeasurement } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const NAME: keyof IAnimal = 'measurements';

const MeasurementAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();

  const { data: measurements, load } = useDataLoader(api.lookup.getTaxonMeasurements);

  if (values.general.taxon_id) {
    load(values.general.taxon_id);
  }

  const newMeasurement: IAnimalMeasurement = {
    taxon_measurement_id: '',
    value: '' as unknown as number,
    qualitative_option_id: '',
    measured_timestamp: '' as unknown as Date,
    measurement_comment: ''
  };

  return (
    <FieldArray name={NAME}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMeasurementTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalMarkingTitle2}
            titleHelp={SurveyAnimalsI18N.animalMeasurementHelp}
            btnLabel={SurveyAnimalsI18N.animalMeasurementAddBtn}
            handleAddSection={() => push(newMeasurement)}
            handleRemoveSection={remove}>
            {values.measurements.map((_cap, index) => (
              <MeasurementFormContent key={`measurement-form-${index}`} index={index} measurements={measurements} />
            ))}
          </FormSectionWrapper>
        </>
      )}
    </FieldArray>
  );
};

interface MeasurementFormContentProps {
  index: number;
  measurements?: IMeasurementStub[];
}

const MeasurementFormContent = ({ index, measurements }: MeasurementFormContentProps) => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();
  const [measurement, setMeasurement] = useState<IMeasurementStub>();

  const taxonMeasurementId = values.measurements[index].taxon_measurement_id;
  const isQuantMeasurement = has(measurement, 'unit');

  const tmIDName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'taxon_measurement_id', index);
  const valName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'value', index);
  const opIDName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'qualitative_option_id', index);

  useEffect(() => {
    setFieldValue(valName, '');
    setFieldValue(opIDName, '');
    const m = measurements?.find((m) => m.taxon_measurement_id === taxonMeasurementId);
    setMeasurement(m);
  }, [taxonMeasurementId]);

  const validateValue = async (val: '' | number) => {
    const min = measurement?.min_value ?? 0;
    const max = measurement?.max_value;
    const unit = measurement?.unit ? ` ${measurement.unit}'s` : ``;
    if (val === '') {
      return;
    }
    if (val < min) {
      return `Measurement must be greater than ${min}${unit}`;
    }
    if (max && val > max) {
      return `Measurement must be less than ${max}${unit}`;
    }
  };

  return (
    <Fragment key={`marking-inputs-${index}`}>
      <Grid item xs={4}>
        <FormikSelectWrapper
          label="Measurement Type"
          name={tmIDName}
          controlProps={{ size: 'small', required: true, disabled: !measurements?.length }}>
          {measurements?.map((m) => (
            <MenuItem key={m.taxon_measurement_id} value={m.taxon_measurement_id}>
              {m.measurement_name}
            </MenuItem>
          ))}
        </FormikSelectWrapper>
      </Grid>
      <Grid item xs={4}>
        {!isQuantMeasurement && taxonMeasurementId ? (
          <CbSelectField
            label="Value"
            name={opIDName}
            id="qualitative_option"
            route="taxon_qualitative_measurement_options"
            query={`taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{ size: 'small', required: true, disabled: !taxonMeasurementId }}
          />
        ) : (
            <Field
              as={CustomTextField}
              name={valName}
              label={`Value${measurement?.unit ? ` [${measurement?.unit}'s]` : ``}`}
              other={{ required: true, size: 'small', disabled: !taxonMeasurementId }}
              validate={validateValue}
            />
          )}
      </Grid>
      <Grid item xs={4}>
        <CustomTextField
          other={{ required: true, size: 'small', type: 'date', InputLabelProps: { shrink: true } }}
          label="Measured Date"
          name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'measured_timestamp', index)}
        />
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
