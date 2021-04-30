import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepContent from '@material-ui/core/StepContent';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { DATE_FORMAT } from 'constants/dateFormats';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import {
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
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
  IProjectPermitForm,
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import {
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import { Formik, FormikProps } from 'formik';
import * as History from 'history';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useQuery } from 'hooks/useQuery';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ICreatePermitNoSamplingRequest, ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';
import { Prompt } from 'react-router-dom';
import { validateFormFieldsAndReportCompletion } from 'utils/customValidation';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { getFormattedDate } from 'utils/Utils';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from './components/ProjectDraftForm';

export interface ICreateProjectStep {
  stepTitle: string;
  stepSubTitle?: string;
  stepContent: any;
  stepValues: any;
  stepValidation?: any;
}

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
  }
}));

const NUM_PARTIAL_PROJECT_STEPS = 2;
const NUM_ALL_PROJECT_STEPS = 9;

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const queryParams = useQuery();

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [hasLoadedDraftData, setHasLoadedDraftData] = useState(!queryParams.draftId);

  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  // Tracks the active step #
  const [activeStep, setActiveStep] = useState(0);

  // Tracks if sections of the form have been completed
  const [formStepsValid, setFormStepsValid] = useState([false, true, false, false, false, true, true, true, true]);

  // The number of steps listed in the UI based on the current state of the component/forms
  const [numberOfSteps, setNumberOfSteps] = useState<number>(NUM_ALL_PROJECT_STEPS);

  // All possible step forms, and their current state
  const [stepForms, setStepForms] = useState<ICreateProjectStep[]>([]);

  // Reference to pass to the formik component in order to access its state at any time
  // Used by the draft logic to fetch the values of a step form that has not been validated/completed
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Whether or not to show the 'Are you sure you want to cancel' dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // Whether or not to show the text dialog
  const [openErrorDialogProps, setOpenErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: CreateProjectI18N.createErrorTitle,
    dialogText: CreateProjectI18N.createErrorText,
    open: false,
    onClose: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    },
    onOk: () => {
      setOpenErrorDialogProps({ ...openErrorDialogProps, open: false });
    }
  });

  // Whether or not to show the 'Save as draft' dialog
  const [openDraftDialog, setOpenDraftDialog] = useState(false);

  const [draft, setDraft] = useState({ id: 0, date: '' });
  const [initialProjectFieldData, setInitialProjectFieldData] = useState<ICreateProjectRequest>({
    coordinator: ProjectCoordinatorInitialValues,
    permit: ProjectPermitFormInitialValues,
    project: ProjectDetailsFormInitialValues,
    objectives: ProjectObjectivesFormInitialValues,
    species: ProjectSpeciesFormInitialValues,
    location: ProjectLocationFormInitialValues,
    iucn: ProjectIUCNFormInitialValues,
    funding: ProjectFundingFormInitialValues,
    partnerships: ProjectPartnershipsFormInitialValues
  });

  // Get draft project fields if draft id exists
  useEffect(() => {
    const getDraftProjectFields = async () => {
      const response = await biohubApi.draft.getDraft(queryParams.draftId);

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
  }, [biohubApi.draft, hasLoadedDraftData, queryParams.draftId]);

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodeSets = async () => {
      const response = await biohubApi.codes.getAllCodeSets();

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
  }, [biohubApi, isLoadingCodes, codes]);

  // Initialize the forms for each step of the workflow
  useEffect(() => {
    if (!codes || !hasLoadedDraftData) {
      return;
    }

    if (stepForms.length) {
      return;
    }

    setStepForms([
      {
        stepTitle: 'Project Coordinator',
        stepSubTitle:
          'Enter the contact information for the person directly responsible for the project. This information will be used as the primary contact should questions arise about this project.',
        stepContent: <ProjectStepComponents component="ProjectCoordinator" codes={codes} />,
        stepValues: initialProjectFieldData.coordinator,
        stepValidation: ProjectCoordinatorYupSchema
      },
      {
        stepTitle: 'Permits',
        stepSubTitle:
          'Enter your scientific collection, wildlife act and/or park use permits associated with this project. Provide the last 6 digits of the permit number. The last 6 digits are those after the hyphen (e.g. for KA12-845782 enter 845782).',
        stepContent: (
          <ProjectPermitForm
            onValuesChange={(values) => {
              if (isSamplingConducted(values)) {
                setNumberOfSteps(NUM_ALL_PROJECT_STEPS);
              } else {
                setNumberOfSteps(NUM_PARTIAL_PROJECT_STEPS);
              }
            }}
          />
        ),
        stepValues: initialProjectFieldData.permit,
        stepValidation: ProjectPermitFormYupSchema
      },
      {
        stepTitle: 'General Information',
        stepSubTitle: 'Enter general information and details about this project.',
        stepContent: <ProjectStepComponents component="ProjectDetails" codes={codes} />,
        stepValues: initialProjectFieldData.project,
        stepValidation: ProjectDetailsFormYupSchema
      },
      {
        stepTitle: 'Objectives',
        stepSubTitle:
          'Describe the objectives of the project and list any caveats, or cautionary detail to be considered when evaluating, or interpreting this project.',
        stepContent: <ProjectStepComponents component="ProjectObjectives" codes={codes} />,
        stepValues: initialProjectFieldData.objectives,
        stepValidation: ProjectObjectivesFormYupSchema
      },
      {
        stepTitle: 'Locations',
        stepSubTitle:
          'Specify FLNRO region, location description and spatial boundary information for the overall project area.',
        stepContent: <ProjectStepComponents component="ProjectLocation" codes={codes} />,
        stepValues: initialProjectFieldData.location,
        stepValidation: ProjectLocationFormYupSchema
      },
      {
        stepTitle: 'Species',
        stepSubTitle:
          'Specify which species were the primary target of the project and any ancillary species which were secondary to the targeted species.',
        stepContent: <ProjectStepComponents component="ProjectSpecies" codes={codes} />,
        stepValues: initialProjectFieldData.species,
        stepValidation: ProjectSpeciesFormYupSchema
      },
      {
        stepTitle: 'IUCN Conservation Actions Classification',
        stepSubTitle: `Conservation actions are specific actions or sets of tasks undertaken by project staff designed to reach each of the project's objectives.`,
        stepContent: <ProjectStepComponents component="ProjectIUCN" codes={codes} />,
        stepValues: initialProjectFieldData.iucn,
        stepValidation: ProjectIUCNFormYupSchema
      },
      {
        stepTitle: 'Funding',
        stepSubTitle:
          'Specify funding sources for the project. Dollar amounts are not intended to be exact, please round to the nearest 100.',
        stepContent: <ProjectStepComponents component="ProjectFunding" codes={codes} />,
        stepValues: initialProjectFieldData.funding,
        stepValidation: ProjectFundingFormYupSchema
      },
      {
        stepTitle: 'Partnerships',
        stepSubTitle:
          'Specify any indigenous partnerships for the project and/or any other partnerships that have not been previously identified in the funding sources section above.',
        stepContent: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
        stepValues: initialProjectFieldData.partnerships,
        stepValidation: ProjectPartnershipsFormYupSchema
      }
    ]);
  }, [codes, stepForms, initialProjectFieldData, hasLoadedDraftData]);

  /**
   * Return true if the user has indicated that sampling has been conducted.
   *
   * @param {IProjectPermitForm} permitFormValues
   * @return {boolean} {boolean}
   */
  const isSamplingConducted = (permitFormValues: IProjectPermitForm): boolean => {
    if (!permitFormValues.permits.length) {
      return true;
    }

    return permitFormValues?.permits?.some((permitItem) => permitItem.sampling_conducted === 'true');
  };

  const updateSteps = () => {
    if (!formikRef?.current) {
      return;
    }

    setStepForms((currentStepForms) => {
      let updatedStepForms = [...currentStepForms];
      updatedStepForms[activeStep].stepValues = formikRef.current?.values;
      return updatedStepForms;
    });
  };

  const updateFormStepValidity = async () => {
    if (!formikRef?.current) {
      return;
    }

    const isValid = await validateFormFieldsAndReportCompletion(
      formikRef.current?.values,
      formikRef.current?.validateForm
    );

    setFormStepsValid((currentFormsComplete: boolean[]) => {
      let newFormsCompleteState = [...currentFormsComplete];
      newFormsCompleteState[activeStep] = isValid;
      return newFormsCompleteState;
    });
  };

  const handleSaveAndChangeStep = async (step: number) => {
    updateSteps();
    await updateFormStepValidity();
    goToStep(step);
  };

  const handleSaveAndNext = async () => {
    updateSteps();
    await updateFormStepValidity();
    goToNextStep();
  };

  const handleSaveAndBack = async () => {
    updateSteps();
    await updateFormStepValidity();
    goToPreviousStep();
  };

  const goToNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const goToPreviousStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const goToStep = (index: number) => {
    setActiveStep(index);
  };

  const handleCancel = () => {
    history.push('/projects');
  };

  const handleYesNoDialogClose = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogNo = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogYes = () => {
    history.push('/projects');
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      let response;

      // Get the form data for all steps
      // Fetch the data from the formikRef for whichever step is the active step
      // Why? WIP changes to the active step will not yet be updated into its respective stepForms[n].stepValues
      const draftFormData = {
        coordinator: (activeStep === 0 && formikRef?.current?.values) || stepForms[0].stepValues,
        permit: (activeStep === 1 && formikRef?.current?.values) || stepForms[1].stepValues,
        project: (activeStep === 2 && formikRef?.current?.values) || stepForms[2].stepValues,
        objectives: (activeStep === 3 && formikRef?.current?.values) || stepForms[3].stepValues,
        location: (activeStep === 4 && formikRef?.current?.values) || stepForms[4].stepValues,
        species: (activeStep === 5 && formikRef?.current?.values) || stepForms[5].stepValues,
        iucn: (activeStep === 6 && formikRef?.current?.values) || stepForms[6].stepValues,
        funding: (activeStep === 7 && formikRef?.current?.values) || stepForms[7].stepValues,
        partnerships: (activeStep === 8 && formikRef?.current?.values) || stepForms[8].stepValues
      };

      const draftId = Number(queryParams.draftId) || draft?.id;

      if (draftId) {
        response = await biohubApi.draft.updateDraft(draftId, values.draft_name, draftFormData);
      } else {
        response = await biohubApi.draft.createDraft(values.draft_name, draftFormData);
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

      history.push(`/projects`);
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
    for (let i = 0; i < formStepsValid.length; i++) {
      if (!formStepsValid[i]) {
        return i;
      }
    }

    // All steps are valid
    return -1;
  };

  /**
   * Handle creation of partial or full projects.
   */
  const handleSubmit = async () => {
    const invalidStepIndex = getFirstInvalidFormStep();
    const isFullProject = isSamplingConducted(stepForms[1].stepValues);
    const draftId = Number(queryParams.draftId);

    if ((isFullProject && invalidStepIndex >= 0) || (!isFullProject && [0, 1].includes(invalidStepIndex))) {
      setActiveStep(invalidStepIndex);

      showCreateErrorDialog({
        dialogTitle: 'Create Project Form Incomplete',
        dialogText: 'The form is missing some required fields/sections. Please fill them out and try again.'
      });

      return;
    }

    try {
      if (!isFullProject) {
        const response = await createPermitNoSampling({
          coordinator: stepForms[0].stepValues,
          permit: stepForms[1].stepValues
        });

        if (!response) {
          return;
        }

        // when project has been created, if a draft is still associated to the project, delete it
        if (draftId) {
          await deleteDraft(draftId);
        }

        setEnableCancelCheck(false);

        history.push(`/projects`);
      } else {
        const response = await createProject({
          coordinator: stepForms[0].stepValues,
          permit: stepForms[1].stepValues,
          project: stepForms[2].stepValues,
          objectives: stepForms[3].stepValues,
          location: stepForms[4].stepValues,
          species: stepForms[5].stepValues,
          iucn: stepForms[6].stepValues,
          funding: stepForms[7].stepValues,
          partnerships: stepForms[8].stepValues
        });

        if (!response) {
          return;
        }

        // when project has been created, if a draft is still associated to the project, delete it
        if (draftId) {
          await deleteDraft(draftId);
        }

        setEnableCancelCheck(false);

        history.push(`/projects/${response.id}`);
      }
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({
        dialogTitle: 'Error Creating Project',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  /**
   * Deletes a draft record
   * (called when project is successfully created for record which was once a draft)
   *
   * @param {number} draftId
   * @returns {*}
   */
  const deleteDraft = async (draftId: number) => {
    try {
      await biohubApi.draft.deleteDraft(draftId);
    } catch (error) {
      return error;
    }
  };

  /**
   * Creates a new project record in which no sampling was conducted
   *
   * @param {ICreatePermitNoSamplingRequest} projectNoSamplingPostObject
   * @return {*}
   */
  const createPermitNoSampling = async (projectNoSamplingPostObject: ICreatePermitNoSamplingRequest) => {
    const response = await biohubApi.project.createPermitNoSampling(projectNoSamplingPostObject);

    if (!response?.ids?.length) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a permit ID' });
      return;
    }

    return response;
  };

  /**
   * Creates a new project record
   *
   * @param {ICreateProjectRequest} projectPostObject
   * @return {*}
   */
  const createProject = async (projectPostObject: ICreateProjectRequest) => {
    const response = await biohubApi.project.createProject(projectPostObject);

    if (!response?.id) {
      showCreateErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    return response;
  };

  const showDraftErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setOpenErrorDialogProps({
      ...openErrorDialogProps,
      dialogTitle: CreateProjectDraftI18N.draftErrorTitle,
      dialogText: CreateProjectDraftI18N.draftErrorText,
      ...textDialogProps,
      open: true
    });
  };

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setOpenErrorDialogProps({
      ...openErrorDialogProps,
      dialogTitle: CreateProjectI18N.cancelTitle,
      dialogText: CreateProjectI18N.createErrorText,
      ...textDialogProps,
      open: true
    });
  };

  /**
   * Build an array of form steps, based on the current value of `numberOfSteps`
   *
   * Example: if `numberOfSteps=4`, then return an array of 4 `<Step>` items, one for each of the  first 4 elements of
   * the `formSteps` array.
   *
   * @return {*}
   */
  const getProjectSteps = () => {
    const stepsToRender = [];

    for (let index = 0; index < numberOfSteps; index++) {
      stepsToRender.push(
        <Step key={stepForms[index].stepTitle}>
          <StepLabel onClick={() => handleSaveAndChangeStep(index)}>
            <Box>
              <Typography variant="h2" className={classes.stepTitle}>
                {stepForms[index].stepTitle}
              </Typography>
              <Typography variant="subtitle1">{stepForms[index].stepSubTitle}</Typography>
            </Box>
          </StepLabel>
          <StepContent>
            <Box my={3}>
              <Formik
                innerRef={formikRef}
                initialValues={stepForms[index].stepValues}
                validationSchema={stepForms[index].stepValidation}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values) => {
                  handleSaveAndNext();
                }}>
                {(props) => (
                  <>
                    {stepForms[index].stepContent}
                    <Box my={4}>
                      <Divider />
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        {activeStep !== 0 && (
                          <Button
                            disabled={!activeStep}
                            variant="outlined"
                            color="primary"
                            onClick={() => handleSaveAndBack()}
                            className={classes.actionButton}>
                            Previous
                          </Button>
                        )}
                      </Box>
                      <Box>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          onClick={props.submitForm}
                          className={classes.actionButton}>
                          Next
                        </Button>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={handleCancel}
                          className={classes.actionButton}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </>
                )}
              </Formik>
            </Box>
          </StepContent>
        </Step>
      );
    }

    return stepsToRender;
  };

  if (!stepForms.length) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!openCancelDialog) {
      // If the cancel dialog is not open: open it
      setOpenCancelDialog(true);
      return false;
    }

    // If the cancel dialog is already open and a location change action is triggered by `handleDialogYes`: allow it
    return true;
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <YesNoDialog
        dialogTitle={CreateProjectI18N.cancelTitle}
        dialogText={CreateProjectI18N.cancelText}
        open={openCancelDialog}
        onClose={handleYesNoDialogClose}
        onNo={handleDialogNo}
        onYes={handleDialogYes}
      />
      <EditDialog
        dialogTitle="Save Incomplete Project as a Draft"
        dialogSaveButtonLabel="Save"
        open={openDraftDialog}
        component={{
          element: <ProjectDraftForm />,
          initialValues: {
            draft_name:
              (activeStep === 2 && formikRef.current?.values.project_name) ||
              stepForms[2].stepValues.project_name ||
              ProjectDraftFormInitialValues.draft_name
          },
          validationSchema: ProjectDraftFormYupSchema
        }}
        onCancel={() => setOpenDraftDialog(false)}
        onSave={(values) => handleSubmitDraft(values)}
      />
      <ErrorDialog {...openErrorDialogProps} />
      <Box my={3}>
        <Container maxWidth="md">
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
          <Box mt={5} mb={2}>
            <Divider />
          </Box>
          <Box>
            <Stepper nonLinear activeStep={activeStep} orientation="vertical" className={classes.stepper}>
              {getProjectSteps()}
            </Stepper>
            {activeStep === numberOfSteps && (
              <Paper square elevation={0} className={classes.finishContainer}>
                <Box mb={3}>
                  <Typography variant="h3">All steps complete!</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Box>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={async () => {
                        goToPreviousStep();
                      }}
                      className={classes.actionButton}>
                      Previous
                    </Button>
                  </Box>
                  <Box>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      className={classes.actionButton}>
                      Create Project
                    </Button>
                    <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </Paper>
            )}
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default CreateProjectPage;
