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
/*
  TODO:
  - replace existing StartEndDateFields, not sure if this is possible
  - make UI better
  - look into fieldset child relationship
  - display errors from api
*/
const FundingSourceForm: React.FC = (props) => {
  const formikProps = useFormikContext<IFundingSourceData>();
  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Box component={'fieldset'} mt={3}>
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend">Name and description</Typography>
            <CustomTextField name="name" label="Name" other={{ required: true }} />
          </Box>
          <Box sx={{ mb: 3 }}>
            <CustomTextField
              name="description"
              label="Description"
              other={{ multiline: true, required: true, rows: 4 }}
            />
          </Box>
        </Box>
        <Box component={'fieldset'} sx={{ mb: 8 }}>
          <Box sx={{ mb: 3 }}>
            <Typography component="legend" variant="h5">
              Effective Dates
            </Typography>
            <Typography variant="body1" color="textSecondary" style={{ maxWidth: '72ch' }}>
              Effective date description
            </Typography>
          </Box>
          <Box>
            <StartEndDateFields
              formikProps={formikProps}
              startName="start_date"
              endName="end_date"
              startRequired={false}
              endRequired={false}
            />
          </Box>
        </Box>
        <hr />
      </Box>
    </form>
  );
};

export default FundingSourceForm;
