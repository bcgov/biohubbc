import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import Select from '@material-ui/core/Select';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import { AccessRequestI18N } from 'constants/i18n';
import { AuthStateContext } from 'contexts/authStateContext';
import { ConfigContext } from 'contexts/configContext';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { Redirect, useHistory } from 'react-router';
import yup from 'utils/YupSchema';

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

const AccessRequestFormInitialValues: IAccessRequestForm = {
  role: ('' as unknown) as number,
  work_from_regional_office: '',
  regional_offices: [],
  comments: ''
};

const AccessRequestFormYupSchema = yup.object().shape({
  role: yup.string().required('Required'),
  work_from_regional_office: yup.string().required('Required'),
  regional_offices: yup
    .array()
    .when('work_from_regional_office', { is: 'true', then: yup.array().min(1).required('Required') }),
  comments: yup.string().max(300, 'Maximum 300 characters')
});

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
  const config = useContext(ConfigContext);

  const { keycloakWrapper } = useContext(AuthStateContext);

  const [openErrorDialogProps, setOpenErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: AccessRequestI18N.requestTitle,
    dialogText: AccessRequestI18N.requestText,
    open: false,
    onClose: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    },
    onOk: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    }
  });

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
    setOpenErrorDialogProps({
      ...openErrorDialogProps,
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
        username: keycloakWrapper?.getUserIdentifier(),
        identitySource: keycloakWrapper?.getIdentitySource()
      });

      if (!response?.id) {
        showAccessRequestErrorDialog({
          dialogError: 'The response from the server was null.'
        });
        return;
      }
      setIsSubmittingRequest(false);

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

  if (keycloakWrapper?.hasAccessRequest) {
    return <Redirect to="/request-submitted" />;
  }

  return (
    <Box>
      <Container maxWidth="md">
        <Formik
          initialValues={AccessRequestFormInitialValues}
          validationSchema={AccessRequestFormYupSchema}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={(values) => {
            setIsSubmittingRequest(true);

            handleSubmitAccessRequest(values);
          }}>
          {({ values, touched, errors, handleChange, handleSubmit, setFieldValue }) => (
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
                      <Box my={3}>
                        <Grid container spacing={3}>
                          <Grid item xs={12}>
                            <h3> Select which role you want to be assigned to</h3>
                            <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                              <InputLabel id="role-label">Role</InputLabel>
                              <Select
                                id="role"
                                name="role"
                                labelId="role-label"
                                label="Role"
                                value={values.role}
                                labelWidth={300}
                                onChange={handleChange}
                                error={touched.role && Boolean(errors.role)}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Role' }}>
                                {codes?.system_roles.map((item) => (
                                  <MenuItem key={item.id} value={item.id}>
                                    {item.name}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>{errors.role}</FormHelperText>
                            </FormControl>
                          </Grid>

                          <Grid item xs={12}>
                            <FormControl
                              required={true}
                              component="fieldset"
                              onChange={(event: any) => {
                                if (event.target.value === 'false') {
                                  setFieldValue('regional_offices', []);
                                }
                              }}
                              error={touched.work_from_regional_office && Boolean(errors.work_from_regional_office)}>
                              <FormLabel component="legend" className={classes.legend}>
                                Do you work for a Regional Office?
                              </FormLabel>
                              <Box mt={2}>
                                <RadioGroup
                                  name="work_from_regional_office"
                                  aria-label="work_from_regional_office"
                                  value={values.work_from_regional_office}
                                  onChange={handleChange}>
                                  <FormControlLabel
                                    value="true"
                                    data-testid="yes-regional-office"
                                    control={<Radio required={true} color="primary" />}
                                    label="Yes"
                                  />
                                  <FormControlLabel
                                    value="false"
                                    data-testid="no-regional-office"
                                    control={<Radio required={true} color="primary" />}
                                    label="No"
                                  />
                                  <FormHelperText>{errors.work_from_regional_office}</FormHelperText>
                                </RadioGroup>
                              </Box>
                            </FormControl>
                          </Grid>

                          {values.work_from_regional_office === 'true' && (
                            <Grid item xs={12}>
                              <h3>Which Regional Offices do you work for? </h3>
                              <MultiAutocompleteFieldVariableSize
                                id={'regional_offices'}
                                label={'Regions'}
                                options={
                                  codes?.regional_offices?.map((item) => {
                                    return { value: item.id, label: item.name };
                                  }) || []
                                }
                              />
                            </Grid>
                          )}

                          <Grid item xs={12}>
                            <h3>Additional comments</h3>
                            <TextField
                              fullWidth
                              id="comments"
                              name="comments"
                              label="Comments "
                              variant="outlined"
                              multiline
                              rows={4}
                              value={values.comments}
                              onChange={handleChange}
                              error={touched.comments && Boolean(errors.comments)}
                              helperText={errors.comments}
                            />
                          </Grid>
                        </Grid>
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
                              if (!config || !config.KEYCLOAK_CONFIG || !config.KEYCLOAK_CONFIG.url) {
                                return;
                              }

                              window.location.href = `${config.KEYCLOAK_CONFIG.url}/realms/${
                                config.KEYCLOAK_CONFIG.realm
                              }/protocol/openid-connect/logout?redirect_uri=${encodeURI(
                                window.location.origin
                              )}/${encodeURI('access-request')}`;
                            }}
                            className={classes.actionButton}>
                            Log out
                          </Button>
                        </Box>
                      </Box>
                    </form>
                  </Box>
                </Paper>
              </Box>
              <ErrorDialog {...openErrorDialogProps} />
            </>
          )}
        </Formik>
      </Container>
    </Box>
  );
};

export default AccessRequestPage;
