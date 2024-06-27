import Grid from '@mui/material/Grid';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import yup from 'utils/YupSchema';

export const DeviceDetailsInitialValues = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    progress_id: null,
    survey_types: [],
    revision_count: 0
  },
  species: {
    focal_species: [],
    ancillary_species: []
  },
  permit: {
    permits: []
  }
};

export const DeviceDetailsYupSchema = () => yup.object();

interface IDeviceDetailsFormProps {
  deviceMakes: { label: string; value: string }[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const DeviceDetailsForm = (props: IDeviceDetailsFormProps) => {
  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <AutocompleteField
            name="device_make"
            id="device_make"
            label="Manufacturer"
            options={props.deviceMakes}
            required={true}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField name="device_model" label="Model (optional)" maxLength={200} />
        </Grid>
      </Grid>
    </>
  );
};

export default DeviceDetailsForm;
