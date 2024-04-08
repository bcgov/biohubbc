import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import EditDialog from 'components/dialog/EditDialog';
import { CbSelectWrapper } from 'components/fields/CbSelectFieldWrapper';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { Field } from 'formik';
import { useDialogContext } from 'hooks/useContext';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import {
  CBMeasurementType,
  CBQualitativeMeasurementTypeDefinition,
  CBQuantitativeMeasurementTypeDefinition,
  IQualitativeMeasurementResponse,
  IQuantitativeMeasurementResponse
} from 'interfaces/useCritterApi.interface';
import { has, startCase } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterMeasurementSchema,
  ICreateCritterMeasurement,
  isRequiredInSchema
} from '../animal';

/**
 * This component renders a 'critter measurement' create / edit dialog.
 *
 * @param {AnimalFormProps<IQuantitativeMeasurementResponse | IQualitativeMeasurementResponse>} props - Generic AnimalFormProps.
 * @returns {*}
 */
export const MeasurementAnimalForm = (
  props: AnimalFormProps<IQuantitativeMeasurementResponse & IQualitativeMeasurementResponse>
) => {
  const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const [loading, setLoading] = useState(false);
  const [measurementTypeDef, setMeasurementTypeDef] = useState<CBMeasurementType | undefined>();

  const { data: measurements, load: loadMeasurements } = useDataLoader(() =>
    cbApi.xref.getTaxonMeasurements(props.critter.itis_tsn)
  );
  loadMeasurements();

  const isQualitative = has(measurementTypeDef, 'options');

  const measurementDefs = useMemo(() => {
    return measurements ? [...measurements.qualitative, ...measurements.quantitative] : [];
  }, [measurements]);

  useEffect(() => {
    const foundMeasurementDef = measurementDefs.find(
      (measurement) => measurement.taxon_measurement_id === props.formObject?.taxon_measurement_id
    );
    setMeasurementTypeDef(foundMeasurementDef);
  }, [measurementDefs, props?.formObject?.taxon_measurement_id]);

  const handleSave = async (values: ICreateCritterMeasurement) => {
    setLoading(true);
    try {
      if (isQualitative) {
        delete values.measurement_quantitative_id;
        delete values.value;

        props.formMode === ANIMAL_FORM_MODE.ADD
          ? await cbApi.measurement.createQualitativeMeasurement(values)
          : await cbApi.measurement.updateQualitativeMeasurement(values);
      } else {
        delete values.measurement_qualitative_id;
        delete values.qualitative_option_id;
        values = { ...values, value: Number(values.value) };

        props.formMode === ANIMAL_FORM_MODE.ADD
          ? await cbApi.measurement.createQuantitativeMeasurement(values)
          : await cbApi.measurement.updateQuantitativeMeasurement(values);
      }
      dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created measurement.` });
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter measurement request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  const validateQuantitativeMeasurement = async (val: '' | number) => {
    const quantitativeTypeDef = measurementTypeDef as CBQuantitativeMeasurementTypeDefinition;
    const min = quantitativeTypeDef?.min_value ?? 0;
    const max = quantitativeTypeDef?.max_value;
    const unit = quantitativeTypeDef?.unit ? quantitativeTypeDef.unit : ``;
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

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Measurement' : 'Edit Measurement'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      size={'md'}
      debug
      component={{
        initialValues: {
          measurement_qualitative_id: props.formObject?.measurement_qualitative_id,
          measurement_quantitative_id: props.formObject?.measurement_quantitative_id,
          critter_id: props.critter.critter_id,
          taxon_measurement_id: props.formObject?.taxon_measurement_id ?? '',
          qualitative_option_id: props?.formObject?.qualitative_option_id,
          value: props?.formObject?.measurement_quantitative_id ? props.formObject?.value : ('' as unknown as number),
          measured_timestamp: props.formObject?.measured_timestamp as unknown as Date,
          measurement_comment: props.formObject?.measurement_comment ? props.formObject?.measurement_comment : undefined
        },
        validationSchema: CreateCritterMeasurementSchema,
        element: (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <CbSelectWrapper
                label="Type"
                name={'taxon_measurement_id'}
                controlProps={{
                  required: isRequiredInSchema(CreateCritterMeasurementSchema, 'taxon_measurement_id'),
                  disabled: !measurementDefs?.length || props.formMode === ANIMAL_FORM_MODE.EDIT
                }}>
                {measurementDefs?.map((measurementDef) => (
                  <MenuItem
                    key={measurementDef.taxon_measurement_id}
                    value={measurementDef.taxon_measurement_id}
                    onClick={() => setMeasurementTypeDef(measurementDef)}>
                    {startCase(measurementDef.measurement_name)}
                  </MenuItem>
                ))}
              </CbSelectWrapper>
            </Grid>
            <Grid item xs={12}>
              {isQualitative ? (
                <CbSelectWrapper
                  label="Value"
                  name={'qualitative_option_id'}
                  controlProps={{
                    required: isQualitative,
                    disabled: !isQualitative
                  }}>
                  {(measurementTypeDef as CBQualitativeMeasurementTypeDefinition)?.options?.map((qualitativeOption) => (
                    <MenuItem
                      key={qualitativeOption.qualitative_option_id}
                      value={qualitativeOption.qualitative_option_id}>
                      {startCase(qualitativeOption.option_label)}
                    </MenuItem>
                  ))}
                </CbSelectWrapper>
              ) : (
                <Field
                  as={CustomTextField}
                  name={'value'}
                  label={
                    (measurementTypeDef as CBQuantitativeMeasurementTypeDefinition)?.unit
                      ? `Value [${(measurementTypeDef as CBQuantitativeMeasurementTypeDefinition).unit}]`
                      : `Value`
                  }
                  other={{
                    required: !isQualitative,
                    disabled: isQualitative
                  }}
                  validate={validateQuantitativeMeasurement}
                />
              )}
            </Grid>
            <Grid item xs={12}>
              <SingleDateField
                name={'measured_timestamp'}
                required={isRequiredInSchema(CreateCritterMeasurementSchema, 'measured_timestamp')}
                label="Date Measurement Taken"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                other={{
                  size: 'medium',
                  multiline: true,
                  minRows: 3,
                  required: isRequiredInSchema(CreateCritterMeasurementSchema, 'measurement_comment')
                }}
                label="Comments"
                name={'measurement_comment'}
              />
            </Grid>
          </Grid>
        )
      }}
    />
  );
};

export default MeasurementAnimalForm;
