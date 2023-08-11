import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AccessRequestI18N } from 'constants/i18n';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import {
  IBCeIDBasicAccessRequestDataObject,
  IBCeIDBusinessAccessRequestDataObject,
  IIDIRAccessRequestDataObject
} from 'interfaces/useAdminApi.interface';
import React, { ReactElement, useContext, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import BCeIDRequestForm, {
  BCeIDBasicRequestFormInitialValues,
  BCeIDBasicRequestFormYupSchema,
  BCeIDBusinessRequestFormInitialValues,
  BCeIDBusinessRequestFormYupSchema
} from './BCeIDRequestForm';
import IDIRRequestForm, { IDIRRequestFormInitialValues, IDIRRequestFormYupSchema } from './IDIRRequestForm';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

/**
 * Access Request form
 *
 * @return {*}
 */
export const AccessRequestPage: React.FC = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();
  const history = useHistory();

  const { keycloakWrapper } = useContext(AuthStateContext);

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

  const codesDataLoader = useDataLoader(() => biohubApi.codes.getAllCodeSets());
  codesDataLoader.load();

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
        userGuid: keycloakWrapper?.getUserGuid() as string,
        name: keycloakWrapper?.displayName as string,
        username: keycloakWrapper?.getUserIdentifier() as string,
        email: keycloakWrapper?.email as string,
        identitySource: keycloakWrapper?.getIdentitySource() as string,
        displayName: keycloakWrapper?.displayName as string
      });

      if (!response?.id) {
        showAccessRequestErrorDialog({
          dialogError: 'The response from the server was null.'
        });
        return;
      }
      setIsSubmittingRequest(false);

      keycloakWrapper?.refresh();

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

  if (!keycloakWrapper?.keycloak.authenticated) {
    // User is not logged in
    return <Redirect to={{ pathname: '/' }} />;
  }

  if (!keycloakWrapper.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (keycloakWrapper?.hasAccessRequest) {
    // User already has a pending access request
    return <Redirect to={{ pathname: '/request-submitted' }} />;
  }

  let initialValues:
    | IIDIRAccessRequestDataObject
    | IBCeIDBasicAccessRequestDataObject
    | IBCeIDBusinessAccessRequestDataObject;

  let validationSchema:
    | typeof IDIRRequestFormYupSchema
    | typeof BCeIDBasicRequestFormYupSchema
    | typeof BCeIDBusinessRequestFormYupSchema;

  let requestForm: ReactElement;

  switch (keycloakWrapper?.getIdentitySource()) {
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
      requestForm = <IDIRRequestForm codes={codesDataLoader.data} />;
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
              <Typography variant="h1">Request Access</Typography>
              <Box mt={3}>
                <Typography variant="body1" color="textSecondary">
                  You will need to provide some additional details before accessing this application.
                </Typography>
              </Box>
              <Box mt={4}>
                <form onSubmit={handleSubmit}>
                  {requestForm}
                  <Box mt={4} display="flex" justifyContent="flex-end">
                    <LoadingButton
                      loading={isSubmittingRequest}
                      type="submit"
                      variant="contained"
                      color="primary"
                      className={classes.actionButton}>
                      <strong>Submit Request</strong>
                    </LoadingButton>
                    <Button
                      variant="outlined"
                      color="primary"
                      component={Link}
                      to="/logout"
                      className={classes.actionButton}
                      data-testid="logout-button">
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
