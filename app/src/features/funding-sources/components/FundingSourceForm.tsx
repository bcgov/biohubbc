import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';

export interface IFundingSourceData {
  funding_source_id: number | null;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  revision_count: number | null;
}

const FundingSourceForm: React.FC = () => {
  const formikProps = useFormikContext<IFundingSourceData>();

  return (
    <form>
      <Box>
        <Box component={'fieldset'} mb={4}>
          <Typography component="legend">Name and Description</Typography>
          <Box mt={0.5} mb={3}>
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
        </Box>

        <Box component={'fieldset'}>
          <Typography component="legend">Effective Dates</Typography>
          <Box mt={0.5}>
            <StartEndDateFields
              formikProps={formikProps}
              startName="start_date"
              endName="end_date"
              startRequired={false}
              endRequired={false}
            />
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default FundingSourceForm;
