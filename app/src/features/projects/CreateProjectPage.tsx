import {
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { CreateProjectDraftI18N, CreateProjectI18N } from 'constants/i18n';
import {
  IProjectCoordinatorForm,
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import {
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import {
  IProjectIUCNForm,
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
} from 'features/projects/components/ProjectIUCNForm';
import {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import {
  IProjectSpeciesForm,
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import {
  IProjectPartnershipsForm,
  ProjectPartnershipsFormInitialValues,
  ProjectPartnershipsFormYupSchema
} from 'features/projects/components/ProjectPartnershipsForm';
import { Formik } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreatePermitNoSamplingRequest, ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import * as History from 'history';
import { Prompt } from 'react-router-dom';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import ProjectDraftForm, {
  IProjectDraftForm,
  ProjectDraftFormInitialValues,
  ProjectDraftFormYupSchema
} from './components/ProjectDraftForm';
import { getFormattedDate } from 'utils/Utils';
import { DATE_FORMAT } from 'constants/dateFormats';

export interface ICreateProjectStep {
  stepTitle: string;
  stepSubTitle?: string;
  stepContent: any;
  stepValues: any;
  stepValidation?: any;
}

const useStyles = makeStyles((theme) => ({
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

  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const [enableCancelCheck, setEnableCancelCheck] = useState(true);

  // Tracks the active step #
  const [activeStep, setActiveStep] = useState(0);

  // The number of steps listed in the UI based on the current state of the component/forms
  const [numberOfSteps, setNumberOfSteps] = useState<number>(NUM_ALL_PROJECT_STEPS);

  // All possible step forms, and their current state
  const [stepForms, setStepForms] = useState<ICreateProjectStep[]>([]);

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

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodeSets = async () => {
      const response = await biohubApi.codes.getAllCodeSets();

      if (!response) {
        // TODO error handling/user messaging - Cant create a project if required code sets fail to fetch
      }

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
    if (!codes) {
      return;
    }

    if (stepForms.length) {
      return;
    }

    setStepForms([
      {
        stepTitle: 'Project Coordinator',
        stepSubTitle: 'Enter contact details for the project coordinator',
        stepContent: <ProjectStepComponents component="ProjectCoordinator" codes={codes} />,
        stepValues: ProjectCoordinatorInitialValues,
        stepValidation: ProjectCoordinatorYupSchema
      },
      {
        stepTitle: 'Permits',
        stepSubTitle: 'Enter permits associated with this project',
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
        stepValues: ProjectPermitFormInitialValues,
        stepValidation: ProjectPermitFormYupSchema
      },
      {
        stepTitle: 'General Information',
        stepSubTitle: 'General information and details about this project',
        stepContent: <ProjectStepComponents component="ProjectDetails" codes={codes} />,
        stepValues: ProjectDetailsFormInitialValues,
        stepValidation: ProjectDetailsFormYupSchema
      },
      {
        stepTitle: 'Objectives',
        stepSubTitle: 'Enter the objectives and potential caveats for this project',
        stepContent: <ProjectStepComponents component="ProjectObjectives" codes={codes} />,
        stepValues: ProjectObjectivesFormInitialValues,
        stepValidation: ProjectObjectivesFormYupSchema
      },
      {
        stepTitle: 'Location',
        stepSubTitle: 'Specify project regions and boundary information',
        stepContent: <ProjectStepComponents component="ProjectLocation" codes={codes} />,
        stepValues: ProjectLocationFormInitialValues,
        stepValidation: ProjectLocationFormYupSchema
      },
      {
        stepTitle: 'Species',
        stepSubTitle: 'Information about species this project is inventorying or monitoring',
        stepContent: <ProjectStepComponents component="ProjectSpecies" codes={codes} />,
        stepValues: ProjectSpeciesFormInitialValues,
        stepValidation: ProjectSpeciesFormYupSchema
      },
      {
        stepTitle: 'IUCN Classification',
        stepSubTitle: 'Lorem ipsum dolor sit amet, consectur whatever whatever',
        stepContent: <ProjectStepComponents component="ProjectIUCN" codes={codes} />,
        stepValues: ProjectIUCNFormInitialValues,
        stepValidation: ProjectIUCNFormYupSchema
      },
      {
        stepTitle: 'Funding',
        stepSubTitle: 'Specify funding sources for the project',
        stepContent: <ProjectStepComponents component="ProjectFunding" codes={codes} />,
        stepValues: ProjectFundingFormInitialValues,
        stepValidation: ProjectFundingFormYupSchema
      },
      {
        stepTitle: 'Partnerships',
        stepSubTitle: 'Specify partnerships for the project',
        stepContent: <ProjectStepComponents component="ProjectPartnerships" codes={codes} />,
        stepValues: ProjectPartnershipsFormInitialValues,
        stepValidation: ProjectPartnershipsFormYupSchema
      }
    ]);
  }, [codes, stepForms]);

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

  const updateSteps = (values: any) => {
    setStepForms((currentStepForms) => {
      let updatedStepForms = [...currentStepForms];
      updatedStepForms[activeStep].stepValues = values;
      return updatedStepForms;
    });
  };

  const handleSaveAndNext = (values: any) => {
    updateSteps(values);
    goToNextStep();
  };

  const handleSaveAndBack = (values: any) => {
    updateSteps(values);
    goToPreviousStep();
  };

  const goToNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const goToPreviousStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
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

  const getProjectFormData = (): ICreateProjectRequest => {
    return {
      coordinator: stepForms[0].stepValues as IProjectCoordinatorForm,
      permit: stepForms[1].stepValues as IProjectPermitForm,
      project: stepForms[2].stepValues as IProjectDetailsForm,
      objectives: stepForms[3].stepValues as IProjectObjectivesForm,
      location: stepForms[4].stepValues as IProjectLocationForm,
      species: stepForms[5].stepValues as IProjectSpeciesForm,
      iucn: stepForms[6].stepValues as IProjectIUCNForm,
      funding: stepForms[7].stepValues as IProjectFundingForm,
      partnerships: stepForms[8].stepValues as IProjectPartnershipsForm
    };
  };

  const handleSubmitDraft = async (values: IProjectDraftForm) => {
    try {
      let response;

      if (draft?.id) {
        response = await biohubApi.draft.updateDraft(draft.id, values.draft_name, getProjectFormData());
      } else {
        response = await biohubApi.draft.createDraft(values.draft_name, getProjectFormData());
      }

      setOpenDraftDialog(false);

      if (!response?.id) {
        showCreateErrorDialog({
          dialogError: 'The response from the server was null, or did not contain a draft project ID.'
        });

        return;
      }

      setDraft({ id: response.id, date: response.date });
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
   * Handle creation of partial or full projects.
   */
  const handleSubmit = async () => {
    try {
      const formData = getProjectFormData();

      if (!isSamplingConducted(formData.permit)) {
        await createPermitNoSampling({
          coordinator: formData.coordinator,
          permit: formData.permit
        });
      } else {
        await createProject(formData);
      }
    } catch (error) {
      const apiError = error as APIError;
      showCreateErrorDialog({ dialogError: apiError?.message, dialogErrorDetails: apiError?.errors });
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

    setEnableCancelCheck(false);

    history.push(`/projects`);
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

    setEnableCancelCheck(false);

    history.push(`/projects/${response.id}`);
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
          <StepLabel>
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
                initialValues={stepForms[index].stepValues}
                validationSchema={stepForms[index].stepValidation}
                validateOnBlur={true}
                validateOnChange={false}
                onSubmit={(values) => {
                  handleSaveAndNext(values);
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
                            onClick={() => handleSaveAndBack(props.values)}
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
    return <CircularProgress />;
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
          initialValues: ProjectDraftFormInitialValues,
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
              Save as Draft
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
            <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepper}>
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
                      onClick={goToPreviousStep}
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
