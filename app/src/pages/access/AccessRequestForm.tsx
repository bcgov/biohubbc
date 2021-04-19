import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { useFormik } from 'formik';
//import { Formik, FormikHelpers } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import TextField from '@material-ui/core/TextField';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
//import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
//import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';

interface IAccessRequestForm {
  role: string;
  work_from_regional_office: boolean;
  regional_offices: string[];
  comments1: string;
  comments2: string;
}

const RoleList = ['Role1', 'Role2'];

// const RegionalOfficeList = [
//   'RegionalOffice1',
//   'RegionalOffice2'
// ];

const AccessRequestFormInitialValues: IAccessRequestForm = {
  role: RoleList[0],
  work_from_regional_office: true,
  regional_offices: [],
  comments1: '',
  comments2: ''
};

const AccessRequestFormYupSchema = yup.object().shape({
  role: yup.string().required('Required'),
  work_from_regional_office: yup.boolean(),
  regional_offices: yup.array().required('Required'),
  comments1: yup.string().max(3, 'Maximum 3 characters').required('Required'),
  comments2: yup.string().max(4, 'Maximum 4 characters').required('Required')
});

// const showAccessRequestErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
//   setOpenErrorDialogProps({
//     ...openErrorDialogProps,
//     dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
//     dialogText: CreateProjectDraftI18N.draftErrorText,
//     ...textDialogProps,
//     open: true
//   });
// };


/**
 * Access Request form
 *
 * @return {*}
 */
export const AccessRequestForm: React.FC = () => {
  const formikProps = useFormik<IAccessRequestForm>({
    initialValues: AccessRequestFormInitialValues,
    validationSchema: AccessRequestFormYupSchema,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));

      handleSubmitAccessRequest(values);
    }
  });

  const handleSubmitAccessRequest = async (values: IAccessRequestForm) => {
    //const response = await biohubApi.accessRequest.createAccessRequest(values);

    try {
      let response;

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepValues
      const accessRequestFormData = { values };

      response = await biohubApi.accessRequest.createAdministrativeActivity(accessRequestFormData);

      if (!response?.id) {
        // showCreateErrorDialog({
        //   dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        // });

        return;
      }

      //setDraft({ id: response.id, date: response.date });
    } catch (error) {
      //setOpenDraftDialog(false);

      // const apiError = error as APIError;
      // showDraftErrorDialog({
      //   dialogError: apiError?.message,
      //   dialogErrorDetails: apiError?.errors
      // });

      console.log(error);
    }
  };

  const { values, touched, errors, handleChange, handleSubmit } = formikProps;

  const biohubApi = useBiohubApi();

  return (
    <Box my={3}>
      <Container maxWidth="md">
        <h1>Request Access to BioHub</h1>
        <Typography variant="subtitle1">
          You will need to provide some additional details before accessing this application. Complete the form below to
          request access.
        </Typography>
        <form onSubmit={handleSubmit}>
          <Box my={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required={true}
                  id="comments1"
                  name="comments1"
                  label="Comments 1"
                  variant="outlined"
                  value={values.comments1}
                  onChange={handleChange}
                  error={touched.comments1 && Boolean(errors.comments1)}
                  helperText={errors.comments1}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="comments2"
                  name="comments2"
                  label="Comments 2"
                  variant="outlined"
                  value={values.comments2}
                  onChange={handleChange}
                  error={touched.comments2 && Boolean(errors.comments2)}
                  helperText={errors.comments2}
                />
              </Grid>
            </Grid>
            <button type="submit">Submit</button>
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default AccessRequestForm;
