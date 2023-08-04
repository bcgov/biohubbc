import Typography from '@mui/material/Typography';
import { Box } from '@mui/system';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export const FundingSourceYupSchema = yup.object().shape({
  funding_source_id: yup.number().nullable(),
  name: yup.string().required('A funding source name is required'),
  description: yup.string().max(200).required('A description is required'),
  start_date: yup.string().isValidDateString(),
  end_date: yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date')
});
export type FundingSourceData = yup.InferType<typeof FundingSourceYupSchema>;

const FundingSourceForm: React.FC = (props) => {
  const formikProps = useFormikContext<FundingSourceData>();
  const { handleSubmit } = formikProps;

  return (
    <form onSubmit={handleSubmit}>
      <Box component={'fieldset'}>
        <Box>
          <Typography component="legend">Name and description</Typography>
          <CustomTextField name="name" label="Name" other={{ required: true }} />
          <CustomTextField
            name="description"
            label="Description"
            other={{ multiline: true, required: true, rows: 4 }}
          />
        </Box>
        <Box>
          <Typography component="legend">Effective Dates</Typography>
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
      </Box>
    </form>
  );
};

export default FundingSourceForm;
