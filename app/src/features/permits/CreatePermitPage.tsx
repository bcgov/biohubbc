import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { CreatePermitsI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { DialogContext } from 'contexts/dialogContext';
import yup from 'utils/YupSchema';
import ProjectCoordinatorForm from 'features/projects/components/ProjectCoordinatorForm';
import ProjectPermitForm from 'features/projects/components/ProjectPermitForm';
import { validateFormFieldsAndReportCompletion } from 'utils/customValidation';
import { APIError } from 'hooks/api/useAxios';
import * as History from 'history';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { ICreatePermitsRequest } from 'interfaces/usePermitApi.interface';

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
  surveySection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),

    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  },
  sectionDivider: {
    height: '1px'
  }
}));

export interface IPermitsArrayItem {
  permit_number: string;
  permit_type: string;
}

export interface ICreatePermitsForm {
  first_name: string;
  last_name: string;
  email_address: string;
  coordinator_agency: string;
  share_contact_details: string;
  permits: IPermitsArrayItem[];
}

export const PermitsInitialValues: ICreatePermitsForm = {
  first_name: '',
  last_name: '',
  email_address: '',
  coordinator_agency: '',
  share_contact_details: 'false',
  permits: [
    {
      permit_number: '',
      permit_type: ''
    }
  ]
};

export const PermitsYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  email_address: yup
    .string()
    .max(500, 'Cannot exceed 500 characters')
    .email('Must be a valid email address')
    .required('Required'),
  coordinator_agency: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  share_contact_details: yup.string().required('Required'),
  permits: yup
    .array()
    .of(
      yup.object().shape({
        permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Required'),
        permit_type: yup.string().required('Required')
      })
    )
    .isUniquePermitNumber('Permit numbers must be unique')
});

/**
 * Page to create non-sampling permits.
 *
 * @return {*}
 */
const CreatePermitPage = () => {
  const urlParams = useParams();
  const classes = useStyles();
  const restorationTrackerApi = useRestorationTrackerApi();
  const history = useHistory();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await restorationTrackerApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, restorationTrackerApi.codes, isLoadingCodes, codes]);

  const defaultCancelDialogProps = {
    dialogTitle: CreatePermitsI18N.cancelTitle,
    dialogText: CreatePermitsI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/admin/permits`);
    }
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreatePermitsI18N.createErrorTitle,
      dialogText: CreatePermitsI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/admin/permits`);
  };

  /**
   * Creates new permit records
   *
   * @param {ICreatePermitsRequest} permitsPostObject
   * @return {*}
   */
  const createPermits = async (permitsPostObject: ICreatePermitsRequest) => {
    const response = await restorationTrackerApi.permit.createPermits(permitsPostObject);

    if (!response) {
      showCreateErrorDialog();
      return;
    }

    return response;
  };

  /**
   * Handle creation of permits.
   */
  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    await formikRef.current?.submitForm();

    const isValid = await validateFormFieldsAndReportCompletion(
      formikRef.current?.values,
      formikRef.current?.validateForm
    );

    if (!isValid) {
      showCreateErrorDialog({
        dialogTitle: 'Create Permits Form Incomplete',
        dialogText:
          'The form is missing some required fields/sections highlighted in red. Please fill them out and try again.'
      });

      return;
    }

    try {
      const { permits, ...coordinator } = formikRef.current?.values;

      const response = await createPermits({ coordinator, permit: { permits } });

      if (!response) {
        return;
      }

      setEnableCancelCheck(false);

      history.push('/admin/permits');
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Permits',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  if (!codes) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Typography variant="h1">Create Non-Sampling Permits</Typography>
          </Box>
          <Box mb={5}>
            <Typography variant="body1">
              Please add any non-sampling permits here. You can later associate them to a project at any time.
            </Typography>
          </Box>
          <Box component={Paper} display="block">
            <Formik
              innerRef={formikRef}
              initialValues={PermitsInitialValues}
              validationSchema={PermitsYupSchema}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={() => {}}>
              <>
                <HorizontalSplitFormComponent
                  title="Coordinator Information"
                  summary="Enter the contact information for the person directly responsible for the permit. This information will be used as the primary contact should questions arise about this permit."
                  component={
                    <ProjectCoordinatorForm
                      coordinator_agency={
                        codes?.coordinator_agency?.map((item) => {
                          return item.name;
                        }) || []
                      }
                    />
                  }></HorizontalSplitFormComponent>
                <Divider className={classes.sectionDivider} />

                <HorizontalSplitFormComponent
                  title="Non-Sampling Permits"
                  summary="Enter any scientific collection, wildlife act and/or park use permits. Provide the last 6 digits of the permit number. The last 6 digits are those after the hyphen (e.g. for KA12-845782 enter 845782)."
                  component={<ProjectPermitForm />}></HorizontalSplitFormComponent>
                <Divider className={classes.sectionDivider} />
              </>
            </Formik>
            <Box p={3} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                className={classes.actionButton}>
                Save and Exit
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreatePermitPage;
