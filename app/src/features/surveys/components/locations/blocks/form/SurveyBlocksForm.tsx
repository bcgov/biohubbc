import Box from '@mui/material/Box';
import CustomTextField from 'components/fields/CustomTextField';

export interface ISurveyBlock {
  survey_block_id: number | null;
  name: string;
  description: string;
  sample_block_count?: number;
  // Temporary uuid used for react key prop
  v4?: string;
}

const SurveyBlocksForm = () => {
  return (
    <form>
      <Box mb={3}>
        <CustomTextField
          name="name"
          label="Name"
          maxLength={50}
          other={{ placeholder: 'Maximum 50 characters', required: true }}
        />
      </Box>
      <CustomTextField
        name="description"
        label="Description"
        maxLength={250}
        other={{ multiline: true, placeholder: 'Maximum 250 characters', required: true, rows: 3 }}
      />
    </form>
  );
};

export default SurveyBlocksForm;
