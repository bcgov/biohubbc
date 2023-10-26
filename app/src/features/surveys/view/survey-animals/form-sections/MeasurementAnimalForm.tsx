import { Grid, MenuItem, SelectChangeEvent } from '@mui/material';
import CbSelectField from 'components/fields/CbSelectField';
import { CbSelectWrapper } from 'components/fields/CbSelectFieldWrapper';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { Field, FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { IMeasurementStub } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { has } from 'lodash-es';
import { Fragment, useEffect, useState } from 'react';
import {
  AnimalMeasurementSchema,
  getAnimalFieldName,
  IAnimal,
  IAnimalMeasurement,
  isRequiredInSchema
} from '../animal';
import { ANIMAL_SECTIONS_FORM_MAP } from '../animal-sections';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

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
  const { animalKeyName, defaultFormValue } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalMeasurementTitle];

  const { data: measurements, refresh, load } = useDataLoader(api.lookup.getTaxonMeasurements);

  if (values.general.taxon_id) {
    load(values.general.taxon_id);
  }

  useEffect(() => {
    refresh(values.general.taxon_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.general.taxon_id]);

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
    <FieldArray name={animalKeyName}>
      {({ remove, push }: FieldArrayRenderProps) => (
        <>
          <FormSectionWrapper
            title={SurveyAnimalsI18N.animalMeasurementTitle}
            addedSectionTitle={SurveyAnimalsI18N.animalMeasurementTitle2}
            titleHelp={SurveyAnimalsI18N.animalMeasurementHelp}
            btnLabel={SurveyAnimalsI18N.animalMeasurementAddBtn}
            disableAddBtn={!canAddMeasurement()}
            handleAddSection={() => push(defaultFormValue)}
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

export const MeasurementFormContent = ({ index, measurements }: MeasurementFormContentProps) => {
  const { values, handleChange, setFieldValue, handleBlur } = useFormikContext<IAnimal>();
  const { animalKeyName } = ANIMAL_SECTIONS_FORM_MAP[SurveyAnimalsI18N.animalMeasurementTitle];
  const taxonMeasurementId = values.measurements[index].taxon_measurement_id;
  const [currentMeasurement, setCurrentMeasurement] = useState<IMeasurementStub | undefined>(
    measurements?.find((lookup_measurement) => lookup_measurement.taxon_measurement_id === taxonMeasurementId)
  );
  const isQuantMeasurement = has(currentMeasurement, 'unit');

  const taxonMeasurementIDName = getAnimalFieldName<IAnimalMeasurement>(animalKeyName, 'taxon_measurement_id', index);
  const valueName = getAnimalFieldName<IAnimalMeasurement>(animalKeyName, 'value', index);
  const optionName = getAnimalFieldName<IAnimalMeasurement>(animalKeyName, 'qualitative_option_id', index);

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
    const unit = currentMeasurement?.unit ? ` ${currentMeasurement.unit}'s` : ``;
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

  const handleMeasurementName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'measurement_name', index), label);
  };

  const handleQualOptionName = (_value: string, label: string) => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'option_label', index), label);
  };

  return (
    <Fragment>
      <Grid item xs={4}>
        <CbSelectWrapper
          label="Measurement Type"
          name={taxonMeasurementIDName}
          onChange={handleMeasurementTypeChange}
          controlProps={{
            size: 'medium',
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
            route="xref/taxon-qualitative-measurement-options"
            query={`taxon_measurement_id=${taxonMeasurementId}`}
            controlProps={{
              size: 'medium',
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
            label={currentMeasurement?.unit ? `Value [${currentMeasurement.unit}'s]` : `Value`}
            other={{
              required: true,
              size: 'medium',
              disabled: !taxonMeasurementId
            }}
            validate={validateValue}
          />
        )}
      </Grid>
      <Grid item xs={4}>
        <SingleDateField
          name={getAnimalFieldName<IAnimalMeasurement>(animalKeyName, 'measured_timestamp', index)}
          required={isRequiredInSchema(AnimalMeasurementSchema, 'measured_timestamp')}
          label={'Measured Date'}
          other={{ size: 'medium' }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInputToggle label={SurveyAnimalsI18N.animalSectionComment('Measurement')}>
          <CustomTextField
            other={{ size: 'medium', required: isRequiredInSchema(AnimalMeasurementSchema, 'measurement_comment') }}
            label="Measurement Comment"
            name={getAnimalFieldName<IAnimalMeasurement>(animalKeyName, 'measurement_comment', index)}
            handleBlur={handleBlur}
          />
        </TextInputToggle>
      </Grid>
    </Fragment>
  );
};

export default MeasurementAnimalForm;
