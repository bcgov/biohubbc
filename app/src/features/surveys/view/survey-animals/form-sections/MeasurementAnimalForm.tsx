import { Grid, MenuItem, SelectChangeEvent } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import { CbSelectWrapper } from 'components/fields/CbSelectFieldWrapper';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IMeasurementStub } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { has } from 'lodash-es';
import React, { Fragment, useState } from 'react';
import { v4 } from 'uuid';
import {
  AnimalMeasurementSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalMeasurement,
  isRequiredInSchema
} from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const NAME: keyof IAnimal = 'measurements';

/**
 * Renders the Measurement section for the Individual Animal form
 *
 * Note a: Requesting the raw unformatted measurement data to allow easier lookups
 * Displays both qualitative / quantitative measurement options in one dropdown.
 * The value / option selector needs to change based on the chosen measurement in first select.
 *
 * Note b: Custom quantiative measurement validation based on min / max values in database.
 *
 * @return {*}
 */

const MeasurementAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();

  const { data: measurements, load } = useDataLoader(api.lookup.getTaxonMeasurements);

  if (values.general.taxon_id) {
    load(values.general.taxon_id);
  }

  const newMeasurement: IAnimalMeasurement = {
    _id: v4(),

    taxon_measurement_id: '',
    value: '' as unknown as number,
    qualitative_option_id: '',
    measured_timestamp: '' as unknown as Date,
    measurement_comment: ''
  };

  const canAddMeasurement = () => {
    const lastMeasurement = values.measurements[values.measurements.length - 1];
    if (!lastMeasurement) {
      return true;
    }
    const { value, qualitative_option_id, taxon_measurement_id, measured_timestamp } = lastMeasurement;
    const hasValueOrOption = value || qualitative_option_id;
    return taxon_measurement_id && measured_timestamp && hasValueOrOption;
  };

  return (
    <FieldArray name={NAME}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMeasurementTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalMeasurementTitle2}
            titleHelp={SurveyAnimalsI18N.animalMeasurementHelp}
            btnLabel={SurveyAnimalsI18N.animalMeasurementAddBtn}
            disableAddBtn={!canAddMeasurement()}
            handleAddSection={() => push(newMeasurement)}
            handleRemoveSection={remove}>
            {values.measurements.map((measurement, index) => (
              <MeasurementFormContent key={`${measurement._id}`} index={index} measurements={measurements} />
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
  const { values, handleChange, setFieldValue, handleBlur } = useFormikContext<IAnimal>();
  const [measurement, setMeasurement] = useState<IMeasurementStub>();

  const taxonMeasurementId = values.measurements[index].taxon_measurement_id;
  const isQuantMeasurement = has(measurement, 'unit');

  const tMeasurementIDName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'taxon_measurement_id', index);
  const valueName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'value', index);
  const optionName = getAnimalFieldName<IAnimalMeasurement>(NAME, 'qualitative_option_id', index);

  const handleMeasurementTypeChange = (event: SelectChangeEvent<unknown>) => {
    handleChange(event);
    setFieldValue(valueName, '');
    setFieldValue(optionName, '');
    const m = measurements?.find((m) => m.taxon_measurement_id === event.target.value);
    setMeasurement(m);
  };

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
    <Fragment>
      <Grid item xs={4}>
        <CbSelectWrapper
          label="Measurement Type"
          name={tMeasurementIDName}
          onChange={handleMeasurementTypeChange}
          controlProps={{
            size: 'small',
            required: isRequiredInSchema(AnimalMeasurementSchema, 'taxon_measurement_id'),
            disabled: !measurements?.length
          }}>
          {measurements?.map((m) => (
            <MenuItem key={m.taxon_measurement_id} value={m.taxon_measurement_id}>
              {m.measurement_name}
            </MenuItem>
          ))}
        </CbSelectWrapper>
      </Grid>
      <Grid item xs={4}>
        {!isQuantMeasurement && taxonMeasurementId ? (
          <CbSelectField
            label="Value"
            name={optionName}
            id="qualitative_option"
            route="taxon_qualitative_measurement_options"
            query={`taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{
              size: 'small',
              required: isRequiredInSchema(AnimalMeasurementSchema, 'qualitative_option_id'),
              disabled: !taxonMeasurementId
            }}
          />
        ) : (
          <Field
            as={CustomTextField}
            name={valueName}
            handleBlur={handleBlur}
            label={measurement?.unit ? `Value [${measurement.unit}'s]` : `Value`}
            other={{
              required: isRequiredInSchema(AnimalMeasurementSchema, 'value'),
              size: 'small',
              disabled: !taxonMeasurementId
            }}
            validate={validateValue}
          />
        )}
      </Grid>
      <Grid item xs={4}>
        <CustomTextField
          other={{
            required: isRequiredInSchema(AnimalMeasurementSchema, 'measured_timestamp'),
            size: 'small',
            type: 'date',
            InputLabelProps: { shrink: true }
          }}
          label="Measured Date"
          name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'measured_timestamp', index)}
          handleBlur={handleBlur}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Measurement')}>
          <CustomTextField
            other={{ size: 'small', required: isRequiredInSchema(AnimalMeasurementSchema, 'measurement_comment') }}
            label="Measurement Comment"
            name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'measurement_comment', index)}
            handleBlur={handleBlur}
          />
        </TextInputToggle>
      </Grid>
    </Fragment>
  );
};

export default MeasurementAnimalForm;
