import { Box, Grid, Typography } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import TelemetrySelectField from 'components/fields/TelemetrySelectField';
import { AttachmentType } from 'constants/attachments';
import { useFormikContext } from 'formik';
import useDataLoader from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { ANIMAL_FORM_MODE, IAnimal } from '../animal';
import { DeploymentFormSection } from './DeploymentFormSection';
import TelemetryFileUpload from './TelemetryFileUpload';

interface telemetryDeviceFormContentProps {
  index: number;
  mode: ANIMAL_FORM_MODE;
}
const TelemetryDeviceFormContent = (props: telemetryDeviceFormContentProps) => {
  const { index, mode } = props;
  const { values } = useFormikContext<IAnimal>();
  const api = useTelemetryApi();
  const device = values.device?.[index];

  const { data: bctwDeviceData, refresh } = useDataLoader(() => api.devices.getDeviceDetails(device.device_id));

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
            <CustomTextField
              label="Device ID"
              name={`device.${index}.device_id`}
              other={{ disabled: mode === ANIMAL_FORM_MODE.EDIT }}
              handleBlur={() => {
                if (device.device_id) {
                  refresh();
                }
              }}
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
                    const codeVals = await api.devices.getCodeValues('frequency_unit');
                    return codeVals.map((a) => a.description);
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={6}>
            <TelemetrySelectField
              label="Device Manufacturer"
              name={`device.${index}.device_make`}
              id="manufacturer"
              fetchData={api.devices.getCollarVendors}
              controlProps={{ disabled: mode === ANIMAL_FORM_MODE.EDIT }}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomTextField label="Device Model (Optional)" name={`device.${index}.device_model`} />
          </Grid>
        </Grid>
      </Box>
      {((device.device_make === 'Vectronic' && !bctwDeviceData?.keyXStatus) || device.device_make === 'Lotek') && (
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
              <TelemetryFileUpload attachmentType={AttachmentType.KEYX} index={index} />
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
              <TelemetryFileUpload attachmentType={AttachmentType.OTHER} index={index} />
            </>
          )}
        </Box>
      )}
      <Box component="fieldset" sx={{ mt: 3 }}>
        <Typography component="legend" variant="body2">
          Deployments
        </Typography>
        <DeploymentFormSection mode={mode} index={index} />
      </Box>
    </>
  );
};

export default TelemetryDeviceFormContent;
