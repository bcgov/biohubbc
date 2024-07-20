import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { AccessRequestI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IBCeIDBasicAccessRequestDataObject,
  IBCeIDBusinessAccessRequestDataObject,
  IIDIRAccessRequestDataObject
} from 'interfaces/useAdminApi.interface';
import React, { ReactElement, useContext, useState } from 'react';
import { useHistory } from 'react-router';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema,
  BCeIDBusinessRequestFormInitialValues,
  BCeIDBusinessRequestFormYupSchema
} from './BCeIDRequestForm';
import IDIRRequestForm, { IDIRRequestFormInitialValues, IDIRRequestFormYupSchema } from './IDIRRequestForm';

const useStyles = () => {
  return {
    actionButton: {
      minWidth: '6rem',
      '& + button': {
        marginLeft: '0.5rem'
      }
    }
  };
};

/**
 * Access Request form
 *
 * @return {*}
 */
export const AccessRequestPage: React.FC = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const authStateContext = useAuthStateContext();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: AccessRequestI18N.requestTitle,
    dialogText: AccessRequestI18N.requestText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  const showAccessRequestErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      dialogTitle: AccessRequestI18N.requestTitle,
      dialogText: AccessRequestI18N.requestText,
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitAccessRequest = async (
    values: IIDIRAccessRequestDataObject | IBCeIDBasicAccessRequestDataObject | IBCeIDBusinessAccessRequestDataObject
  ) => {
    try {
      const response = await biohubApi.admin.createAdministrativeActivity({
        ...values,
        userGuid: authStateContext.simsUserWrapper.userGuid as string,
        name: authStateContext.simsUserWrapper.displayName as string,
        username: authStateContext.simsUserWrapper.userIdentifier as string,
        email: authStateContext.simsUserWrapper.email as string,
        identitySource: authStateContext.simsUserWrapper.identitySource as string,
        displayName: authStateContext.simsUserWrapper.displayName as string
      });

      if (!response?.id) {
        showAccessRequestErrorDialog({
          dialogError: 'The response from the server was null.'
        });
        return;
      }
      setIsSubmittingRequest(false);

      authStateContext.simsUserWrapper.refresh();

      history.push('/request-submitted');
    } catch (error) {
      const apiError = error as APIError;

      showAccessRequestErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });

      setIsSubmittingRequest(false);
    }
  };

  let initialValues:
    | IIDIRAccessRequestDataObject
    | IBCeIDBasicAccessRequestDataObject
    | IBCeIDBusinessAccessRequestDataObject;

  let validationSchema:
    | typeof IDIRRequestFormYupSchema
    | typeof BCeIDBasicRequestFormYupSchema
    | typeof BCeIDBusinessRequestFormYupSchema;

  let requestForm: ReactElement;

  switch (authStateContext.simsUserWrapper.identitySource) {
    case SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS:
      initialValues = BCeIDBusinessRequestFormInitialValues;
      validationSchema = BCeIDBusinessRequestFormYupSchema;
      requestForm = <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS} />;
      break;

    case SYSTEM_IDENTITY_SOURCE.BCEID_BASIC:
      initialValues = BCeIDBasicRequestFormInitialValues;
      validationSchema = BCeIDBasicRequestFormYupSchema;
      requestForm = <BCeIDRequestForm accountType={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC} />;
      break;

    case SYSTEM_IDENTITY_SOURCE.IDIR:
    default:
      initialValues = IDIRRequestFormInitialValues;
      validationSchema = IDIRRequestFormYupSchema;
      requestForm = <IDIRRequestForm />;
  }

  return (
    <Box p={4}>
      <Container maxWidth="md">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={async (values) => {
            setIsSubmittingRequest(true);
            await handleSubmitAccessRequest(values);
          }}>
          {({ handleSubmit }) => (
            <Box component={Paper} p={3}>
              <Typography variant="h3" component="h1">
                Request Access
              </Typography>
              <Box mt={3}>
                <Typography variant="body1" color="textSecondary">
                  The Species Inventory Management System is intended for staff, contractors, and other partners who
                  manage fish and wildlife data in collaboration with the Province. If you are instead looking to
                  download data, please visit BiodiversityHub BC (coming soon).
                  <br />
                  <br />
                  Please briefly describe why you are requesting access and how you will be using the Species Inventory
                  Management System.
                </Typography>
              </Box>
              <Box mt={4}>
                <form onSubmit={handleSubmit}>
                  {requestForm}
                  <Box mt={4} display="flex" justifyContent="flex-end">
                    <Box sx={{ mr: 1 }}>
                      {/* sx prop on LoadingButton causes typescript compilation issues */}
                      <LoadingButton
                        loading={isSubmittingRequest}
                        type="submit"
                        variant="contained"
                        color="primary"
                        sx={classes.actionButton}>
                        Submit Request
                      </LoadingButton>
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => authStateContext.auth.signoutRedirect()}
                      data-testid="access-request-logout-button">
                      Log out
                    </Button>
                  </Box>
                </form>
              </Box>
            </Box>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

export default AccessRequestPage;
