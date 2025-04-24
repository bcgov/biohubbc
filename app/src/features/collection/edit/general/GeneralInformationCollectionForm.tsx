import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';

export interface IGeneralInformationCollectionForm {
  name: string;
  description: string;
}

export const GeneralInformationInitialValues: IGeneralInformationCollectionForm = {
  name: '',
  description: ''
};

/**
 * Create collection - general information fields
 *
 * @return {*}
 */
const GeneralInformationCollectionForm = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomTextField
          name="name"
          label="Name"
          maxLength={200}
          other={{
            required: true
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name="description"
          label="Description"
          maxLength={200}
          other={{
            multiline: true,
            rows: 4
          }}
        />
      </Grid>
    </Grid>
  );
};

export default GeneralInformationCollectionForm;
