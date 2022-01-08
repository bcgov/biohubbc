import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import StepperWizard, { IStepperWizardStep } from 'components/stepper-wizard/StepperWizard';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from 'features/projects/components/ProjectDraftForm';
import {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import { ProjectIUCNFormInitialValues, ProjectIUCNFormYupSchema } from 'features/projects/components/ProjectIUCNForm';
import {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import {
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import ProjectPermitForm, {
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import { FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { useQuery } from 'hooks/useQuery';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetNonSamplingPermit } from 'interfaces/usePermitApi.interface';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import { validateFormFieldsAndReportCompletion } from 'utils/customValidation';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { getFormattedDate } from 'utils/Utils';

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
  stepperContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflowX: 'hidden'
  },
  stepperNav: {
    flex: '0 0 auto',
    width: '33.333%'
  },
  stepperContent: {}
}));

const NUM_ALL_PROJECT_STEPS = 8;

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const restorationTrackerApi = useRestorationTrackerApi();

  const queryParams = useQuery();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [nonSamplingPermits, setNonSamplingPermits] = useState<IGetNonSamplingPermit[]>((null as unknown) as []);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isLoadingNonSamplingPermits, setIsLoadingNonSamplingPermits] = useState(false);
  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  // Tracks the active step #
  const [activeStep, setActiveStep] = useState(0);

  // The number of steps listed in the project creation UI
  const numberOfSteps = NUM_ALL_PROJECT_STEPS;

  // All possible step forms, and their current state
  const [stepForms, setStepForms] = useState<IStepperWizardStep[]>([]);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const formikRef = useRef<FormikProps<any>>(null);

  const [showFormFieldValidationErrors, setShowFormFieldValidationErrors] = useState<null | number>(null);

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  const dialogContext = useContext(DialogContext);

  const defaultCancelDialogProps = {
    dialogTitle: CreateProjectI18N.cancelTitle,
    dialogText: CreateProjectI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push('/admin/projects');
    }
  };

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  // Whether or not to show the 'Save as draft' dialog
  const [openDraftDialog, setOpenDraftDialog] = useState(false);

  const [draft, setDraft] = useState({ id: 0, date: '' });
  const [initialProjectFieldData, setInitialProjectFieldData] = useState<ICreateProjectRequest>({
    coordinator: ProjectCoordinatorInitialValues,
    permit: ProjectPermitFormInitialValues,
    project: ProjectDetailsFormInitialValues,
    objectives: ProjectObjectivesFormInitialValues,
    location: ProjectLocationFormInitialValues,
    iucn: ProjectIUCNFormInitialValues,
    funding: ProjectFundingFormInitialValues,
    partnerships: ProjectPartnershipsFormInitialValues
  });

  // Get non-sampling permits that already exist in system
  useEffect(() => {
    const getNonSamplingPermits = async () => {
      const response = await restorationTrackerApi.permit.getNonSamplingPermits();

      if (!response) {
        return;
      }

      setNonSamplingPermits(() => {
        setIsLoadingNonSamplingPermits(false);
        return response;
      });
    };

    if (!isLoadingNonSamplingPermits && !nonSamplingPermits) {
      getNonSamplingPermits();
      setIsLoadingNonSamplingPermits(true);
    }
  }, [restorationTrackerApi, isLoadingNonSamplingPermits, nonSamplingPermits]);

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await restorationTrackerApi.draft.getDraft(queryParams.draftId);

      setHasLoadedDraftData(true);

      if (!response || !response.data) {
        return;
      }

      setInitialProjectFieldData(response.data);
    };

    if (hasLoadedDraftData) {
      return;
    }

    getDraftProjectFields();
  }, [restorationTrackerApi.draft, hasLoadedDraftData, queryParams.draftId]);

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodeSets = async () => {
      const response = await restorationTrackerApi.codes.getAllCodeSets();

      // TODO error handling/user messaging - Cant create a project if required code sets fail to fetch

      setCodes(() => {
        setIsLoadingCodes(false);
        return response;
      });
    };

    if (!isLoadingCodes && !codes) {
      getAllCodeSets();
      setIsLoadingCodes(true);
    }
  }, [restorationTrackerApi, isLoadingCodes, codes]);

  // Initialize the forms for each step of the workflow
  useEffect(() => {
    if (!codes || !hasLoadedDraftData || !nonSamplingPermits) {
      return;
    }

    if (stepForms.length) {
      return;
    }

    setStepForms([
      {
        stepTitle: 'Project Contact',
        stepSubTitle:
          'Enter the contact information for the person directly responsible for the project. This information will be used as the primary contact should questions arise about this project.',
        stepContent: <ProjectStepComponents component="ProjectCoordinator" codes={codes} />,
        stepInitialValues: initialProjectFieldData.coordinator,
        stepYupSchema: ProjectCoordinatorYupSchema,
        isValid: false,
        isTouched: false
      },
      {
        stepTitle: 'Project Permits',
        stepSubTitle:
          'Enter your scientific collection, wildlife act and/or park use permits associated with this project. Provide the last 6 digits of the permit number. The last 6 digits are those after the hyphen (e.g. for KA12-845782 enter 845782).',
        stepContent: (
          <ProjectPermitForm
            non_sampling_permits={
              nonSamplingPermits?.map((item: IGetNonSamplingPermit) => {
                return { value: item.permit_id, label: `${item.number} - ${item.type}` };
              }) || []
            }
          />
        ),
        stepInitialValues: initialProjectFieldData.permit,
        stepYupSchema: ProjectPermitFormYupSchema,
        isValid: true,
        isTouched: false
      },
      {
        stepTitle: 'General Information',
        stepSubTitle: 'Enter general information and details about this project.',
        stepContent: <ProjectStepComponents component="ProjectDetails" codes={codes} />,
        stepInitialValues: initialProjectFieldData.project,
        stepYupSchema: ProjectDetailsFormYupSchema,
        isValid: false,
        isTouched: false
      },
      {
        stepTitle: 'Objectives',
        stepSubTitle:
          'Describe the objectives of the project and list any caveats, or cautionary detail to be considered when evaluating, or interpreting this project.',
        stepContent: <ProjectStepComponents component="ProjectObjectives" codes={codes} />,
        stepInitialValues: initialProjectFieldData.objectives,
        stepYupSchema: ProjectObjectivesFormYupSchema,
        isValid: false,
        isTouched: false
      },
      {
        stepTitle: 'Locations',
        stepSubTitle: 'Specify a location description and spatial boundary information for the overall project area.',
        stepContent: <ProjectStepComponents component="ProjectLocation" codes={codes} />,
        stepInitialValues: initialProjectFieldData.location,
        stepYupSchema: ProjectLocationFormYupSchema,
        isValid: false,
        isTouched: false
      },
      {
        stepTitle: 'IUCN Conservation Actions Classification',
        stepSubTitle: `Conservation actions are specific actions or sets of tasks undertaken by project staff designed to reach each of the project's objectives.`,
        stepContent: <ProjectStepComponents component="ProjectIUCN" codes={codes} />,
        stepInitialValues: initialProjectFieldData.iucn,
        stepYupSchema: ProjectIUCNFormYupSchema,
        isValid: true,
        isTouched: false
      },
      {
        stepTitle: 'Funding',
        stepSubTitle:
          'Specify funding sources for the project. Dollar amounts are not intended to be exact, please round to the nearest 100.',
        stepContent: <ProjectStepComponents component="ProjectFunding" codes={codes} />,
        stepInitialValues: initialProjectFieldData.funding,
        stepYupSchema: ProjectFundingFormYupSchema,
        isValid: true,
        isTouched: false
      },
      {
        stepTitle: 'Partnerships',
        stepSubTitle:
          'Specify any indigenous partnerships for the project and/or any other partnerships that have not been previously identified in the funding sources section above.',
        stepContent: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
        stepInitialValues: initialProjectFieldData.partnerships,
        stepYupSchema: ProjectPartnershipsFormYupSchema,
        isValid: true,
        isTouched: false
      }
    ]);
  }, [codes, stepForms, initialProjectFieldData, hasLoadedDraftData, nonSamplingPermits]);

  /**
   * Return true if the step form fields are valid, false otherwise.
   *
   * @return {*} {Promise<boolean>}
   */
  const isStepFormValid = useCallback(async (): Promise<boolean> => {
    if (!formikRef.current) {
      return false;
    }

    return validateFormFieldsAndReportCompletion(formikRef.current?.values, formikRef.current?.validateForm);
  }, [formikRef]);

  const updateSteps = useCallback(async () => {
    if (!formikRef?.current) {
      return;
    }

    const isValid = await isStepFormValid();

    setStepForms((currentStepForms) => {
      let updatedStepForms = [...currentStepForms];
      updatedStepForms[activeStep].stepInitialValues = formikRef.current?.values;
      updatedStepForms[activeStep].isValid = isValid;
      updatedStepForms[activeStep].isTouched = true;
      return updatedStepForms;
    });
  }, [activeStep, formikRef, isStepFormValid]);

  const handleSaveAndChangeStep = async (stepIndex: number) => {
    await updateSteps();
    goToStep(stepIndex);
  };

  const handleSubmitProject = async () => {
    await updateSteps();

    const invalidStepIndex = getFirstInvalidFormStep();

    // Check if any step is invalid in project workflow
    const projectInvalid = invalidStepIndex >= 0;

    if (projectInvalid) {
      // Automatically change to the invalid step
      setActiveStep(invalidStepIndex);
      // Indicate that the invalid step show run its field validation, to highlight the invalid fields
      setShowFormFieldValidationErrors(invalidStepIndex);
      return;
    }

    await handleProjectCreation();
  };

  useEffect(() => {
    if (!formikRef?.current) {
      return;
    }

    if (showFormFieldValidationErrors !== activeStep) {
      return;
    }

    setShowFormFieldValidationErrors(null);

    // Submit the form, which will run the validation to indicate which fields are invalid
    formikRef.current.submitForm();

    // Update the step form isValid/isTouched
    setStepForms((currentStepForms) => {
      let updatedStepForms = [...currentStepForms];
      updatedStepForms[activeStep].isValid = false;
      updatedStepForms[activeStep].isTouched = true;
      return updatedStepForms;
    });
  }, [showFormFieldValidationErrors, setShowFormFieldValidationErrors, formikRef, activeStep, updateSteps]);

  const handleSaveAndNext = async () => {
    await updateSteps();
    goToNextStep();
  };

  const handleSaveAndPrevious = async () => {
    await updateSteps();
    goToPreviousStep();
  };

  const goToNextStep = () => {
    if (activeStep === numberOfSteps - 1) {
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const goToPreviousStep = () => {
    if (activeStep === 0) {
      return;
    }

    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const goToStep = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push('/admin/projects');
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      let response;

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepInitialValues
      const draftFormData = {
        coordinator: (activeStep === 0 && formikRef?.current?.values) || stepForms[0].stepInitialValues,
        permit: (activeStep === 1 && formikRef?.current?.values) || stepForms[1].stepInitialValues,
        project: (activeStep === 2 && formikRef?.current?.values) || stepForms[2].stepInitialValues,
        objectives: (activeStep === 3 && formikRef?.current?.values) || stepForms[3].stepInitialValues,
        location: (activeStep === 4 && formikRef?.current?.values) || stepForms[4].stepInitialValues,
        iucn: (activeStep === 5 && formikRef?.current?.values) || stepForms[5].stepInitialValues,
        funding: (activeStep === 6 && formikRef?.current?.values) || stepForms[6].stepInitialValues,
        partnerships: (activeStep === 7 && formikRef?.current?.values) || stepForms[7].stepInitialValues
      };

      const draftId = Number(queryParams.draftId) || draft?.id;

      if (draftId) {
        response = await restorationTrackerApi.draft.updateDraft(draftId, values.draft_name, draftFormData);
      } else {
        response = await restorationTrackerApi.draft.createDraft(values.draft_name, draftFormData);
      }

      setOpenDraftDialog(false);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        });

        return;
      }

      setDraft({ id: response.id, date: response.date });
      setEnableCancelCheck(false);

      history.push(`/admin/projects`);
    } catch (error) {
      setOpenDraftDialog(false);

      const apiError = error as APIError;
      showDraftErrorDialog({
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Returns the step index for the first invalid form step, or `-1` if all steps are valid
   *
   * @return {*} {number}
   */
  const getFirstInvalidFormStep = (): number => {
    for (let i = 0; i < stepForms.length; i++) {
      if (!stepForms[i].isValid) {
        return i;
      }
    }

    // All steps are valid
    return -1;
  };

  /**
   * Handle project creation.
   */
  const handleProjectCreation = async () => {
    try {
      await createProject({
        coordinator: stepForms[0].stepInitialValues,
        permit: stepForms[1].stepInitialValues,
        project: stepForms[2].stepInitialValues,
        objectives: stepForms[3].stepInitialValues,
        location: stepForms[4].stepInitialValues,
        iucn: stepForms[5].stepInitialValues,
        funding: stepForms[6].stepInitialValues,
        partnerships: stepForms[7].stepInitialValues
      });
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Project',
        dialogError: error?.message,
        dialogErrorDetails: error?.errors
      });
    }
  };

  /**
   * Deletes the draft record used when creating this project, if one exists.
   *
   * @param {number} draftId
   * @returns {*}
   */
  const deleteDraft = async () => {
    const draftId = Number(queryParams.draftId);

    if (!draftId) {
      return;
    }

    try {
      await restorationTrackerApi.draft.deleteDraft(draftId);
    } catch (error) {
      return error;
    }
  };

  /**
   * Creates a new project record
   *
   * @param {ICreateProjectRequest} projectPostObject
   * @return {*}
   */
  const createProject = async (projectPostObject: ICreateProjectRequest) => {
    const response = await restorationTrackerApi.project.createProject(projectPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    await deleteDraft();

    setEnableCancelCheck(false);

    history.push(`/admin/projects/${response.id}`);
  };

  const showDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
      dialogText: CreateProjectDraftI18N.draftErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateProjectI18N.createErrorTitle,
      dialogText: CreateProjectI18N.createErrorText,
      ...defaultErrorDialogProps,
      ...textDialogProps,
      open: true
    });
  };

  if (!stepForms.length) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

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

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <EditDialog
        dialogTitle="Save Incomplete Project as a Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <ProjectDraftForm />,
          initialValues: {
            draft_name:
              (activeStep === 2 && formikRef.current?.values.project_name) ||
              stepForms[2].stepInitialValues.project_name ||
              ProjectDraftFormInitialValues.draft_name
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={(values) => handleSubmitDraft(values)}
      />
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Breadcrumbs>
              <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
                <ArrowBack color="primary" fontSize="small" className={classes.breadCrumbLinkIcon} />
                <Typography variant="body2">Cancel and Exit</Typography>
              </Link>
            </Breadcrumbs>
          </Box>
          <Box mb={2} display="flex" justifyContent="space-between">
            <Typography variant="h1">Create Project</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setOpenDraftDialog(true)}
              className={classes.actionButton}>
              Save as Draft and Exit
            </Button>
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <Box visibility={(draft?.date && 'visible') || 'hidden'}>
              <Typography component="span" variant="subtitle2" color="textSecondary">
                {`Draft saved on ${getFormattedDate(DATE_FORMAT.ShortMediumDateTimeFormat, draft.date)}`}
              </Typography>
            </Box>
          </Box>
          <StepperWizard
            activeStep={activeStep}
            steps={stepForms.slice(0, numberOfSteps)}
            innerRef={formikRef}
            onChangeStep={handleSaveAndChangeStep}
            onPrevious={handleSaveAndPrevious}
            onNext={handleSaveAndNext}
            onSubmit={handleSubmitProject}
            onSubmitLabel={'Create project and Exit'}
            onCancel={handleCancel}
          />
        </Container>
      </Box>
    </>
  );
};

export default CreateProjectPage;
