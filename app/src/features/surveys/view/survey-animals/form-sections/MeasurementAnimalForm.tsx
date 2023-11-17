import { Grid, MenuItem, SelectChangeEvent } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import { CbSelectWrapper } from 'components/fields/CbSelectFieldWrapper';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { Field, useFormikContext } from 'formik';
import { IMeasurementStub } from 'hooks/cb_api/useLookupApi';
import { has, startCase } from 'lodash-es';
import { useEffect, useState } from 'react';
import {
  AnimalMeasurementSchema,
  ANIMAL_FORM_MODE,
  getAnimalFieldName,
  IAnimal,
  IAnimalMeasurement,
  isRequiredInSchema
} from '../animal';

/**
 * Renders the Measurement form inputs
 *
 * @return {*}
 */

interface MeasurementFormContentProps {
  index: number;
  measurements?: IMeasurementStub[];
  mode: ANIMAL_FORM_MODE;
}

export const MeasurementAnimalFormContent = (props: MeasurementFormContentProps) => {
  const { index, measurements, mode } = props;
  const name: keyof IAnimal = 'measurements';
  const { values, handleChange, setFieldValue, handleBlur } = useFormikContext<IAnimal>();
  const taxonMeasurementId = values.measurements?.[index]?.taxon_measurement_id;
  const [currentMeasurement, setCurrentMeasurement] = useState<IMeasurementStub | undefined>(
    measurements?.find((lookup_measurement) => lookup_measurement.taxon_measurement_id === taxonMeasurementId)
  );
  const isQuantMeasurement = has(currentMeasurement, 'unit');

  const taxonMeasurementIDName = getAnimalFieldName<IAnimalMeasurement>(name, 'taxon_measurement_id', index);
  const valueName = getAnimalFieldName<IAnimalMeasurement>(name, 'value', index);
  const optionName = getAnimalFieldName<IAnimalMeasurement>(name, 'qualitative_option_id', index);

  useEffect(() => {
    setCurrentMeasurement(measurements?.find((m) => m.taxon_measurement_id === taxonMeasurementId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measurements]); //Sometimes will not display the correct fields without this useEffect but could have side effects, may need to revisit.

  const handleMeasurementTypeChange = (event: SelectChangeEvent<unknown>) => {
    handleChange(event);
    setFieldValue(valueName, '');
    setFieldValue(optionName, '');
    const m = measurements?.find((m) => m.taxon_measurement_id === event.target.value);
    setCurrentMeasurement(m);
    handleMeasurementName('', m?.measurement_name ?? '');
  };

  const validateValue = async (val: '' | number) => {
    const min = currentMeasurement?.min_value ?? 0;
    const max = currentMeasurement?.max_value;
    const unit = currentMeasurement?.unit ? currentMeasurement.unit : ``;
    if (val === '') {
      return;
    }
    if (isNaN(val)) {
      return `Must be a number`;
    }
    if (val < min) {
      return `Measurement must be greater than ${min}${unit}`;
    }
    if (max && val > max) {
      return `Measurement must be less than ${max}${unit}`;
    }
  };

  const handleMeasurementName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'measurement_name', index), label);
  };

  const handleQualOptionName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'option_label', index), label);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CbSelectWrapper
          label="Type"
          name={taxonMeasurementIDName}
          onChange={handleMeasurementTypeChange}
          controlProps={{
            required: isRequiredInSchema(AnimalMeasurementSchema, 'taxon_measurement_id'),
            disabled: !measurements?.length || mode === ANIMAL_FORM_MODE.EDIT
          }}>
          {measurements?.map((m) => (
            <MenuItem key={m.taxon_measurement_id} value={m.taxon_measurement_id}>
              {startCase(m.measurement_name)}
            </MenuItem>
          ))}
        </CbSelectWrapper>
      </Grid>
      <Grid item xs={12}>
        {!isQuantMeasurement && taxonMeasurementId ? (
          <CbSelectField
            label="Value"
            name={optionName}
            id="qualitative_option"
            route="xref/taxon-qualitative-measurement-options"
            query={`taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{
              required: true,
              disabled: !taxonMeasurementId
            }}
            handleChangeSideEffect={handleQualOptionName}
          />
        ) : (
          <Field
            as={CustomTextField}
            name={valueName}
            handleBlur={handleBlur}
            label={currentMeasurement?.unit ? `Value [${currentMeasurement.unit}]` : `Value`}
            other={{
              required: true,
              disabled: !taxonMeasurementId
            }}
            validate={validateValue}
          />
        )}
      </Grid>
      <Grid item xs={12}>
        <SingleDateField
          name={getAnimalFieldName<IAnimalMeasurement>(name, 'measured_timestamp', index)}
          required={isRequiredInSchema(AnimalMeasurementSchema, 'measured_timestamp')}
          label="Date Measurement Taken"
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          other={{
            size: 'medium',
            multiline: true,
            minRows: 3,
            required: isRequiredInSchema(AnimalMeasurementSchema, 'measurement_comment')
          }}
          label="Comments"
          name={getAnimalFieldName<IAnimalMeasurement>(name, 'measurement_comment', index)}
        />
      </Grid>
    </Grid>
  );
};

export default MeasurementAnimalFormContent;
