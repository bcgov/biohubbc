import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import CustomTextField from 'components/fields/CustomTextField';
import { Box } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';

export interface IReportMetaForm {
  report_title: string;
  author_first_name: string;
  author_last_name: string;
  report_abstract: string;
  year_published: string;
}

export const ReportMetaFormInitialValues: IReportMetaForm = {
  report_title: '',
  author_first_name: '',
  author_last_name: '',
  report_abstract: '',
  year_published: ''
};

export const ReportMetaFormYupSchema = yup.object().shape({
  report_title: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  author_first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  author_last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  report_abstract: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  year_published: yup.string().max(50, 'Cannot exceed 50 characters').required('Required')
});

/**
 * Upload Report Meta Data
 *
 * @return {*}
 */




const ReportMetaForm: React.FC = (props) => {
  const formikProps = useFormikContext<IReportMetaForm>();

  const {  handleSubmit} = formikProps;
  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <CustomTextField
              name="report_title"
              label="Title"
              other={{
                required: true
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <CustomTextField
              name="author_first_name"
              label="Author first name"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <CustomTextField
              name="author_last_name"
              label="Author last name"
              other={{
                required: true
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name="report_abstract"
              label="Abstract"
              other={{
                required: true
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name="year_published"
              label="Year published - YYYY"
              other={{
                required: true
              }}
            />
          </Grid>
        </Grid>
      </form>
    </Box>
  );
};

export default ReportMetaForm;
