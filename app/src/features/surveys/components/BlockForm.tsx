import { Box } from '@mui/system';
import CustomTextField from 'components/fields/CustomTextField';
import React from 'react';

export interface IBlockData {
  survey_block_id: number | null;
  name: string;
  description: string;
}

export function isBlockData(obj: IBlockData): obj is IBlockData {
  return 'survey_block_id' in obj;
}

const BlockForm: React.FC = () => {
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

export default BlockForm;
