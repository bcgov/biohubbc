import { Grid } from '@mui/material';
import EditDialog from 'components/dialog/EditDialog';
import CustomTextField from 'components/fields/CustomTextField';
import SingleDateField from 'components/fields/SingleDateField';
import { useDialogContext } from 'hooks/useContext';
import { IQualitativeMeasurementResponse, IQuantitativeMeasurementResponse } from 'interfaces/useCritterApi.interface';
import React, { useState } from 'react';
import {
  AnimalFormProps,
  ANIMAL_FORM_MODE,
  CreateCritterMeasurement,
  ICreateCritterMeasurement,
  isRequiredInSchema
} from '../animal';

/**
 * Renders the Measurement form inputs
 *
 * @return {*}
 */

export const MeasurementAnimalForm = (
  props: AnimalFormProps<IQuantitativeMeasurementResponse & IQualitativeMeasurementResponse>
) => {
  //const cbApi = useCritterbaseApi();
  const dialog = useDialogContext();

  const isQualitative = Boolean((props.formObject as IQualitativeMeasurementResponse).qualitative_option_id);
  console.log(isQualitative);

  //const { index, measurements, mode } = props;

  //const name: keyof IAnimal = 'measurements';
  //const { values, handleChange, setFieldValue, handleBlur } = useFormikContext<IAnimal>();
  // const taxonMeasurementId = values.measurements?.[index]?.taxon_measurement_id;
  // const [currentMeasurement, setCurrentMeasurement] = useState<IMeasurementStub | undefined>(
  //   measurements?.find((lookup_measurement) => lookup_measurement.taxon_measurement_id === taxonMeasurementId)
  // );
  // const isQuantMeasurement = has(currentMeasurement, 'unit');
  //
  // const taxonMeasurementIDName = getAnimalFieldName<IAnimalMeasurement>(name, 'taxon_measurement_id', index);
  // const valueName = getAnimalFieldName<IAnimalMeasurement>(name, 'value', index);
  // const optionName = getAnimalFieldName<IAnimalMeasurement>(name, 'qualitative_option_id', index);

  const [loading, setLoading] = useState(false);

  const handleSave = async (values: ICreateCritterMeasurement) => {
    setLoading(true);
    try {
      if (props.formMode === ANIMAL_FORM_MODE.ADD) {
        //await cbApi.marking.createMarking(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully created marking.` });
      }
      if (props.formMode === ANIMAL_FORM_MODE.EDIT) {
        //await cbApi.marking.updateMarking(values);
        dialog.setSnackbar({ open: true, snackbarMessage: `Successfully edited marking.` });
      }
    } catch (err) {
      dialog.setSnackbar({ open: true, snackbarMessage: `Critter marking request failed.` });
    } finally {
      props.handleClose();
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   setCurrentMeasurement(measurements?.find((m) => m.taxon_measurement_id === taxonMeasurementId));
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [measurements]); //Sometimes will not display the correct fields without this useEffect but could have side effects, may need to revisit.
  //
  // const handleMeasurementTypeChange = (event: SelectChangeEvent<unknown>) => {
  //   handleChange(event);
  //   setFieldValue(valueName, '');
  //   setFieldValue(optionName, '');
  //   const m = measurements?.find((m) => m.taxon_measurement_id === event.target.value);
  //   setCurrentMeasurement(m);
  //   handleMeasurementName('', m?.measurement_name ?? '');
  // };
  //
  // const validateValue = async (val: '' | number) => {
  //   const min = currentMeasurement?.min_value ?? 0;
  //   const max = currentMeasurement?.max_value;
  //   const unit = currentMeasurement?.unit ? currentMeasurement.unit : ``;
  //   if (val === '') {
  //     return;
  //   }
  //   if (isNaN(val)) {
  //     return `Must be a number`;
  //   }
  //   if (val < min) {
  //     return `Measurement must be greater than ${min}${unit}`;
  //   }
  //   if (max && val > max) {
  //     return `Measurement must be less than ${max}${unit}`;
  //   }
  // };

  // const handleMeasurementName = (_value: string, label: string) => {
  //   setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'measurement_name', index), label);
  // };
  //
  // const handleQualOptionName = (_value: string, label: string) => {
  //   setFieldValue(getAnimalFieldName<IAnimalMeasurement>('measurements', 'option_label', index), label);
  // };

  return (
    <EditDialog
      dialogTitle={props.formMode === ANIMAL_FORM_MODE.ADD ? 'Add Measurement' : 'Edit Measurement'}
      open={props.open}
      onCancel={props.handleClose}
      onSave={handleSave}
      dialogLoading={loading}
      component={{
        initialValues: {
          measurement_qualitative_id: props.formObject?.measurement_qualitative_id ?? '',
          measurement_quantitative_id: props.formObject?.measurement_quantitative_id ?? '',
          taxon_measurement_id: props.formObject?.taxon_measurement_id ?? '',
          qualitative_option_id: props.formObject?.qualitative_option_id,
          value: props.formObject?.value,
          measured_timestamp: props.formObject?.measured_timestamp as unknown as Date,
          measurement_comment: props.formObject?.measurement_comment ? props.formObject?.measurement_comment : undefined
        },
        validationSchema: CreateCritterMeasurement,
        element: (
          <Grid container spacing={3}>
            {/* <Grid item xs={12}>
              <CbSelectWrapper
                label="Type"
                name={'taxon_measurement_id'}
                //onChange={handleMeasurementTypeChange}
                controlProps={{
                  required: isRequiredInSchema(AnimalMeasurementSchema, 'taxon_measurement_id')
                  //disabled: !measurements?.length || mode === ANIMAL_FORM_MODE.EDIT
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
                  name={'qualitative_option_id'}
                  id="qualitative_option"
                  route="xref/taxon-qualitative-measurement-options"
                  query={{ tsn: props?.critter.itis_tsn }}
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
            </Grid>*/}
            <Grid item xs={12}>
              <SingleDateField
                name={'measured_timestamp'}
                required={isRequiredInSchema(CreateCritterMeasurement, 'measured_timestamp')}
                label="Date Measurement Taken"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                other={{
                  size: 'medium',
                  multiline: true,
                  minRows: 3,
                  required: isRequiredInSchema(CreateCritterMeasurement, 'measurement_comment')
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
