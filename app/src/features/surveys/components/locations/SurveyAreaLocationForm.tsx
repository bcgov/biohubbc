import Box from '@mui/material/Box';
import CustomTextField from 'components/fields/CustomTextField';

export interface ISurveyAreaLocationForm {
  name: string;
  description: string;
}

const SurveyAreaLocationForm = () => {
  return (
    <form>
      <Box mb={3}>
        <CustomTextField
          name="name"
          label="Name"
          maxLength={100}
          other={{ placeholder: 'Maximum 100 characters', required: true }}
        />
      </Box>
      <CustomTextField
        name="description"
        label="Description"
        maxLength={250}
        other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
      />
    </form>
  );
};

export default SurveyAreaLocationForm;
