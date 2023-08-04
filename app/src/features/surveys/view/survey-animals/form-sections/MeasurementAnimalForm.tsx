import { Grid, MenuItem } from '@mui/material';
import CbSelectField, { FormikSelectWrapper } from 'components/fields/CbSelectField';
import CustomTextField from 'components/fields/CustomTextField';
import { SurveyAnimalsI18N } from 'constants/i18n';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { has } from 'lodash-es';
import React, { Fragment, useEffect, useState } from 'react';
import { getAnimalFieldName, IAnimal, IAnimalMeasurement } from '../animal';
import TextInputToggle from '../TextInputToggle';
import FormSectionWrapper from './FormSectionWrapper';

const NAME: keyof IAnimal = 'measurement';

interface IMeasurement {
  taxon_measurement_id: string;
  measurement_name: string;
  min_value?: number;
  max_value?: number;
  unit?: string;
}
const MeasurementAnimalForm = () => {
  const api = useCritterbaseApi();
  const { values } = useFormikContext<IAnimal>();

  const { data: measurements, load } = useDataLoader(async () =>
    api.lookup.getSelectOptions<IMeasurement>({
      route: 'taxon_measurements',
      query: `taxon_id=${values.general.taxon_id}`,
      asSelect: false
    })
  );

  const canLoadData = !measurements && values.measurement.length > 0 && values.general.taxon_id;

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
  measurements?: IMeasurement[];
}

const MeasurementFormContent = ({ index, measurements }: MeasurementFormContentProps) => {
  const { values, setFieldValue } = useFormikContext<IAnimal>();
  const taxonMeasurementId = values.measurement[index].taxon_measurement_id;
  const [measurement, setMeasurement] = useState<IMeasurement>();
  const isQuantMeasurement = has(measurement, 'unit');

  useEffect(() => {
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>(NAME, 'value', index), '');
    setFieldValue(getAnimalFieldName<IAnimalMeasurement>(NAME, 'option_id', index), '');
    const m = measurements?.find((m) => m.taxon_measurement_id === taxonMeasurementId);
    setMeasurement(m);
  }, [taxonMeasurementId]);

  return (
    <Fragment key={`marking-inputs-${index}`}>
      <Grid item xs={6}>
        <FormikSelectWrapper
          label="Measurement Type"
          name={getAnimalFieldName<IAnimalMeasurement>(NAME, 'taxon_measurement_id', index)}
          controlProps={{ size: 'small', required: true }}>
          {measurements?.map((m) => (
            <MenuItem key={m.taxon_measurement_id} value={m.taxon_measurement_id}>
              {m.measurement_name}
            </MenuItem>
          ))}
        </FormikSelectWrapper>
      </Grid>
      <Grid item xs={6}>
        {!isQuantMeasurement && taxonMeasurementId ? (
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
              label={`Measurement Value${measurement?.unit ? ` (${measurement?.unit}'s)` : ``}`}
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
