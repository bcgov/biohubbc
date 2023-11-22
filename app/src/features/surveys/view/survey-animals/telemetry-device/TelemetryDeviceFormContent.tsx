import { Box, Grid, Typography } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { AttachmentType } from 'constants/attachments';
import { Field, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect } from 'react';
import { ANIMAL_FORM_MODE, IAnimal } from '../animal';
import { DeploymentFormSection } from './DeploymentFormSection';
import TelemetryFileUpload from './TelemetryFileUpload';

interface TelemetryDeviceFormContentProps {
  index: number;
  mode: ANIMAL_FORM_MODE;
}
const TelemetryDeviceFormContent = (props: TelemetryDeviceFormContentProps) => {
  const { index, mode } = props;

  const telemetryApi = useTelemetryApi();
  const { values, validateField } = useFormikContext<IAnimal>();
  let device: any;
  if (values.device?.[index]) {
    device = values.device?.[index];
  } else {
    device = {
      survey_critter_id: '',
      deployments: [],
      device_id: '',
      device_make: '',
      device_model: '',
      frequency: '',
      frequency_unit: ''
    };
  }
  console.log(device);

  const { data: deviceDetails, refresh } = useDataLoader(() => telemetryApi.devices.getDeviceDetails(device.device_id));

  const validateDeviceMake = async (value: number | '') => {
    const deviceMake = deviceDetails?.device?.device_make;
    if (device.device_id && deviceMake && deviceMake !== value && mode === ANIMAL_FORM_MODE.ADD) {
      return `The current make for this device is ${deviceMake}`;
    }
  };

  useEffect(() => {
    if (!device.device_id || !device.device_make) {
      return;
    }
    refresh();
    validateField(`device.${index}.device_make`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.device_id, device.device_make, deviceDetails?.device?.device_make, index]);

  if (!device) {
    return <></>;
  }

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend" variant="body2">
          Device Metadata
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Field
              as={CustomTextField}
              label="Device ID"
              name={`device.${index}.device_id`}
              other={{ disabled: mode === ANIMAL_FORM_MODE.EDIT, required: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <Grid container>
              <Grid
                item
                xs={8}
                sx={{
                  '& .MuiInputBase-root': {
                    borderTopRightRadius: 0,
                    borderBottomRightRadius: 0
                  }
                }}>
                <CustomTextField label="Frequency (Optional)" name={`device.${index}.frequency`} />
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  '& .MuiInputBase-root': {
                    ml: '-1px',
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0
                  }
                }}>
                <TelemetrySelectField
                  label="Units"
                  name={`device.${index}.frequency_unit`}
                  id="frequency_unit"
                  fetchData={async () => {
                    const codeVals = await telemetryApi.devices.getCodeValues('frequency_unit');
                    return codeVals.map((a) => a.description);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <Field
              as={TelemetrySelectField}
              label="Device Manufacturer"
              name={`device.${index}.device_make`}
              id="manufacturer"
              fetchData={telemetryApi.devices.getCollarVendors}
              controlProps={{ disabled: mode === ANIMAL_FORM_MODE.EDIT, required: true }}
              validate={validateDeviceMake}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Device Model (Optional)" name={`device.${index}.device_model`} />
          </Grid>
        </Grid>
      </Box>
      {((device.device_make === 'Vectronic' && !deviceDetails?.keyXStatus) || device.device_make === 'Lotek') && (
        <Box sx={{ mt: 3 }}>
          <Typography component="legend" variant="body2">
            Upload Attachment
          </Typography>
          {device.device_make === 'Vectronic' && (
            <>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  mt: -1,
                  mb: 3
                }}>{`Vectronic KeyX File (Optional)`}</Typography>
              <TelemetryFileUpload
                attachmentType={AttachmentType.KEYX}
                fileKey={`${props.index}.attachmentFile`}
                typeKey={`${props.index}.attachmentType`}
              />
            </>
          )}
          {device.device_make === 'Lotek' && (
            <>
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{
                  mt: -1,
                  mb: 3
                }}>{`Lotek Config File (Optional)`}</Typography>
              <TelemetryFileUpload
                attachmentType={AttachmentType.OTHER}
                fileKey={`${props.index}.attachmentFile`}
                typeKey={`${props.index}.attachmentType`}
              />
            </>
          )}
        </Box>
      )}
      <Box component="fieldset" sx={{ mt: 3 }}>
        <Typography component="legend" variant="body2">
          Deployments
        </Typography>
        <DeploymentFormSection mode={mode} deviceDetails={deviceDetails} index={index} />
      </Box>
      <FormikDevDebugger />
    </>
  );
};

export default TelemetryDeviceFormContent;
