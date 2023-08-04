import { TextField } from '@mui/material';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
export const FundingSourceYupSchema = yup.object().shape({
  funding_source_id: yup.number(),
  name: yup.string().required('A funding source name is required'),
  details: yup.string().max(200).required('A description is required'),
  start_date: yup.string().isValidDateString(),
  end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
});

const FundingSourceForm: React.FC = (props) => {
  const formikProps = useFormikContext<any>();
  console.log(formikProps);
  return (
    <form>
      <Box component={'fieldset'}>
        <Typography id="agency_details" component="legend">
          Name and description
        </Typography>
        <TextField id="name" name="name" label="Name" required />
        <TextField id="description" name="description" label="Description" required />
      </Box>
    </form>
  );
};

export default FundingSourceForm;
