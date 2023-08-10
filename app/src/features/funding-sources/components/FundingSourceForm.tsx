import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
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
}

const FundingSourceForm: React.FC = (props) => {
  const formikProps = useFormikContext<IFundingSourceData>();
  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Box mt={3}>
        <Box component={'fieldset'} mb={4}>
          <Typography component="legend">Name and Description</Typography>
          <Box mb={3} mt={1}>
            <CustomTextField name="name" label="Name" other={{ required: true }} />
          </Box>
          <CustomTextField
            name="description"
            label="Description"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Box>

        <Box component={'fieldset'}>
          <Typography component="legend">Effective Dates</Typography>
          <Box mb={4}>
            <Typography variant="body1" color="textSecondary" style={{ maxWidth: '72ch' }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit.
            </Typography>
          </Box>
          <StartEndDateFields
            formikProps={formikProps}
            startName="start_date"
            endName="end_date"
            startRequired={false}
            endRequired={false}
          />
        </Box>
      </Box>
    </form>
  );
};

export default FundingSourceForm;
