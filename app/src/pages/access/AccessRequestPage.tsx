import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AccessRequestI18N } from 'constants/i18n';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import { IBCeIDAccessRequestDataObject, IIDIRAccessRequestDataObject } from 'interfaces/useAdminApi.interface';
import React, { ReactElement, useContext, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import BCeIDRequestForm, { BCeIDRequestFormInitialValues, BCeIDRequestFormYupSchema } from './BCeIDRequestForm';
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

  const handleSubmitAccessRequest = async (values: IIDIRAccessRequestDataObject | IBCeIDAccessRequestDataObject) => {
    try {
      const response = await biohubApi.admin.createAdministrativeActivity({
        ...values,
        name: keycloakWrapper?.displayName as string,
        username: keycloakWrapper?.getUserIdentifier() as string,
        email: keycloakWrapper?.email as string,
        identitySource: keycloakWrapper?.getIdentitySource() as string
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

  if (!keycloakWrapper?.keycloak?.authenticated) {
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

  let initialValues: IIDIRAccessRequestDataObject | IBCeIDAccessRequestDataObject;
  let validationSchema: typeof IDIRRequestFormYupSchema | typeof BCeIDRequestFormYupSchema;
  let requestForm: ReactElement;

  if (keycloakWrapper?.getIdentitySource() === SYSTEM_IDENTITY_SOURCE.BCEID) {
    initialValues = BCeIDRequestFormInitialValues;
    validationSchema = BCeIDRequestFormYupSchema;
    requestForm = <BCeIDRequestForm />;
  } else {
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
          onSubmit={(values) => {
            setIsSubmittingRequest(true);
            handleSubmitAccessRequest(values);
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
                    <Box className="buttonWrapper" mr={1}>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        className={classes.actionButton}
                        disabled={isSubmittingRequest}>
                        <strong>Submit Request</strong>
                      </Button>
                      {isSubmittingRequest && (
                        <CircularProgress
                          className="buttonProgress"
                          variant="indeterminate"
                          size={20}
                          color="primary"
                        />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => {
                        history.push('/logout');
                      }}
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
