import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import FormikDevDebugger from 'components/formik/FormikDevDebugger';
import { AttachmentType } from 'constants/attachments';
import { Field, useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect } from 'react';
import { ANIMAL_FORM_MODE } from '../animal';
import { DeploymentForm } from './DeploymentForm';
import { IAnimalTelemetryDevice } from './device';
import TelemetryFileUpload from './TelemetryFileUpload';

export interface IAllTelemetryDeviceFormProps {
  mode: ANIMAL_FORM_MODE;
}

const TelemetryDeviceForm = (props: IAllTelemetryDeviceFormProps) => {
  const { mode } = props;

  const telemetryApi = useTelemetryApi();
  const { values: device } = useFormikContext<IAnimalTelemetryDevice>();

  const { data: deviceDetails, refresh, isReady } = useDataLoader(telemetryApi.devices.getDeviceDetails);

  const canRenderFileUpload =
    isReady && ((device.device_make === 'Vectronic' && !deviceDetails?.keyXStatus) || device.device_make === 'Lotek');

  useEffect(() => {
    if (device.device_id && device.device_make) {
      refresh(device.device_id, device.device_make);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device.device_id, device.device_make]);

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
              name={`device_id`}
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
                <CustomTextField label="Frequency (Optional)" name={`frequency`} />
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
                  name={`frequency_unit`}
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
              name={`device_make`}
              id="manufacturer"
              fetchData={telemetryApi.devices.getCollarVendors}
              controlProps={{ disabled: mode === ANIMAL_FORM_MODE.EDIT, required: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Device Model (Optional)" name={`device_model`} />
          </Grid>
        </Grid>
      </Box>
      {canRenderFileUpload && (
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
                fileKey="attachmentFile"
                typeKey="attachmentType"
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
                fileKey="attachmentFile"
                typeKey="attachmentType"
              />
            </>
          )}
        </Box>
      )}
      <Box component="fieldset" sx={{ mt: 3 }}>
        <Typography component="legend" variant="body2">
          Deployments
        </Typography>
        <DeploymentForm mode={mode} deviceDetails={deviceDetails} />
      </Box>
      <FormikDevDebugger />
    </>
  );
};

export default TelemetryDeviceForm;
