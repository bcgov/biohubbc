import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { AccessRequestI18N } from 'constants/i18n';
import { AuthStateContext } from 'contexts/authStateContext';
import { DialogContext } from 'contexts/dialogContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import BCeIDRequestForm, { BCeIDRequestFormInitialValues, BCeIDRequestFormYupSchema } from './BCeIDRequestForm';
import IDIRRequestForm, { IDIRRequestFormInitialValues, IDIRRequestFormYupSchema } from './IDIRRequestForm';

const useStyles = makeStyles((theme: Theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  breadCrumbLinkIcon: {
    marginRight: '0.25rem'
  },
  finishContainer: {
    padding: theme.spacing(3),
    backgroundColor: 'transparent'
  },
  stepper: {
    backgroundColor: 'transparent'
  },
  stepTitle: {
    marginBottom: '0.45rem'
  },
  spacingBottom: {
    marginBottom: '0.9rem'
  },
  legend: {
    marginTop: '1rem',
    float: 'left',
    marginBottom: '0.75rem',
    letterSpacing: '-0.01rem'
  }
}));

interface IAccessRequestForm {
  role: number;
  work_from_regional_office: string;
  regional_offices: number[];
  comments: string;
}

/**
 * Access Request form
 *
 * @return {*}
 */
export const AccessRequestPage: React.FC = () => {
  const classes = useStyles();
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
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

  useEffect(() => {
    const getAllCodeSets = async () => {
      const response = await biohubApi.codes.getAllCodeSets();

      // TODO error handling/user messaging - Cant submit an access request if required code sets fail to fetch

      setCodes(() => {
        setIsLoadingCodes(false);
        return response;
      });
    };

    if (!isLoadingCodes && !codes) {
      getAllCodeSets();
      setIsLoadingCodes(true);
    }
  }, [biohubApi, isLoadingCodes, codes]);

  const showAccessRequestErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      ...defaultErrorDialogProps,
      dialogTitle: AccessRequestI18N.requestTitle,
      dialogText: AccessRequestI18N.requestText,
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmitAccessRequest = async (values: IAccessRequestForm) => {
    try {
      const response = await biohubApi.admin.createAdministrativeActivity({
        ...values,
        name: keycloakWrapper?.displayName,
        username: keycloakWrapper?.getUserIdentifier(),
        email: keycloakWrapper?.email,
        identitySource: keycloakWrapper?.getIdentitySource()
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
    return <Redirect to={{ pathname: '/login' }} />;
  }

  if (!keycloakWrapper.hasLoadedAllUserInfo) {
    // User data has not been loaded, can not yet determine if they have a role
    return <CircularProgress className="pageProgress" />;
  }

  if (keycloakWrapper?.hasAccessRequest) {
    // User already has a pending access request
    return <Redirect to={{ pathname: '/request-submitted' }} />;
  }

  let initialValues: any;
  let validationSchema: any;
  let requestForm: any;

  if (keycloakWrapper?.getIdentitySource()?.toLowerCase() === 'bceid') {
    initialValues = BCeIDRequestFormInitialValues;
    validationSchema = BCeIDRequestFormYupSchema;
    requestForm = <BCeIDRequestForm codes={codes} />;
  } else {
    initialValues = IDIRRequestFormInitialValues;
    validationSchema = IDIRRequestFormYupSchema;
    requestForm = <IDIRRequestForm codes={codes} />;
  }

  return (
    <Box mb={4}>
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
            <>
              <Box>
                <h1>Request Access to BioHub</h1>
                <Typography variant="subtitle1" className={classes.spacingBottom}>
                  You will need to provide some additional details before accessing this application. Complete the form
                  below to request access.
                </Typography>
                <Paper elevation={2} square={true} className={classes.finishContainer}>
                  <h2>Request Details</h2>
                  <Box mb={3}>
                    <form onSubmit={handleSubmit}>
                      {requestForm}
                      <Box my={4}>
                        <Divider />
                      </Box>
                      <Box display="flex" justifyContent="flex-end">
                        <Box className="buttonWrapper" mr={1}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            className={classes.actionButton}
                            disabled={isSubmittingRequest}>
                            Submit Request
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
                        {/*
                          CircularProgress styling examples:
                          https://codesandbox.io/s/wonderful-cartwright-e18nc?file=/demo.tsx:895-1013
                          https://menubar.io/creating-a-material-ui-button-with-spinner-that-reflects-loading-state
                        */}
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
                </Paper>
              </Box>
            </>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

export default AccessRequestPage;
