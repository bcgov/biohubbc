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
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import { CreateProjectI18N } from 'constants/i18n';
import ProjectCoordinatorForm, {
  IProjectCoordinatorForm,
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import ProjectDetailsForm, {
  IProjectDetailsForm,
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import ProjectFundingForm, {
  IProjectFundingForm,
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import ProjectObjectivesForm, {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import ProjectIUCNForm, {
  ProjectIUCNFormInitialValues,
  ProjectIUCNFormYupSchema
} from 'features/projects/components/ProjectIUCNForm';
import ProjectPermitForm, {
  IProjectPermitForm,
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import ProjectSpeciesForm, {
  IProjectSpeciesForm,
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetAllCodesResponse,
  IPartialProjectPostObject,
  IProjectPostObject
} from 'interfaces/useBioHubApi-interfaces';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { IProjectLocationForm } from './components/ProjectLocationForm';

export interface ICreateProjectStep {
  stepTitle: string;
  stepSubTitle?: string;
  stepContent: any;
  stepValues: any;
  stepValidation?: any;
}

export interface IFormStepState {
  formTemplate: any;
  formData: any;
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
const NUM_ALL_PROJECT_STEPS = 8;

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const [codes, setCodes] = useState<IGetAllCodesResponse>();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  // Tracks the active step #
  const [activeStep, setActiveStep] = useState(0);

  // The number of steps listed in the UI based on the current state of the component/forms
  const [numberOfSteps, setNumberOfSteps] = useState<number>(NUM_PARTIAL_PROJECT_STEPS);

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

  // Get code sets
  // TODO refine this call to only fetch code sets this form cares about? Or introduce caching so multiple calls is still fast?
  useEffect(() => {
    const getAllCodes = async () => {
      const response = await biohubApi.getAllCodes();

      if (!response) {
        // TODO error handling/user messaging - Cant create a project if required code sets fail to fetch
      }

      setCodes(() => {
        setIsLoadingCodes(false);
        return response;
      });
    };

    if (!isLoadingCodes && !codes) {
      getAllCodes();
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
        stepContent: (
          <ProjectCoordinatorForm
            coordinator_agency={
              codes?.coordinator_agency?.map((item) => {
                return item.name;
              }) || []
            }
          />
        ),
        stepValues: ProjectCoordinatorInitialValues,
        stepValidation: ProjectCoordinatorYupSchema
      },
      {
        stepTitle: 'Permits',
        stepSubTitle: 'Enter permits associated with this project',
        stepContent: (
          <ProjectPermitForm
            onValuesChange={(values) => {
              if (isAtLeastOnePermitMarkedSamplingConducted(values)) {
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
        stepContent: (
          <ProjectDetailsForm
            project_type={
              codes?.project_type?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            project_activity={
              codes?.project_activity?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            climate_change_initiative={
              codes?.climate_change_initiative?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
          />
        ),
        stepValues: ProjectDetailsFormInitialValues,
        stepValidation: ProjectDetailsFormYupSchema
      },
      {
        stepTitle: 'Objectives',
        stepSubTitle: 'Enter the objectives and potential caveats for this project',
        stepContent: <ProjectObjectivesForm />,
        stepValues: ProjectObjectivesFormInitialValues,
        stepValidation: ProjectObjectivesFormYupSchema
      },
      {
        stepTitle: 'Location',
        stepSubTitle: 'Specify project regions and boundary information',
        stepContent: (
          <ProjectLocationForm
            region={
              codes?.region?.map((item) => {
                return { value: item.name, label: item.name };
              }) || []
            }
          />
        ),
        stepValues: ProjectLocationFormInitialValues,
        stepValidation: ProjectLocationFormYupSchema
      },
      {
        stepTitle: 'Species',
        stepSubTitle: 'Information about species this project is inventorying or monitoring',
        stepContent: (
          <ProjectSpeciesForm
            species={
              codes?.species?.map((item) => {
                return { value: item.name, label: item.name };
              }) || []
            }
          />
        ),
        stepValues: ProjectSpeciesFormInitialValues,
        stepValidation: ProjectSpeciesFormYupSchema
      },
      {
        stepTitle: 'IUCN Classification',
        stepSubTitle: 'Lorem ipsum dolor sit amet, consectur whatever whatever',
        stepContent: (
          <ProjectIUCNForm
            classifications={
              [
                { id: 1, name: 'Class 1' },
                { id: 2, name: 'Class 2' }
              ].map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            subClassifications={
              [
                { id: 1, name: 'Sub-class 1' },
                { id: 2, name: 'Sub-class 2' }
              ].map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
          />
        ),
        stepValues: ProjectIUCNFormInitialValues,
        stepValidation: ProjectIUCNFormYupSchema
      },
      {
        stepTitle: 'Funding and Partnerships',
        stepSubTitle: 'Specify funding and partnerships for the project',
        stepContent: (
          <ProjectFundingForm
            funding_sources={
              codes?.funding_source?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            investment_action_category={
              codes?.investment_action_category?.map((item) => {
                return { value: item.id, fs_id: item.fs_id, label: item.name };
              }) || []
            }
            first_nations={
              codes?.first_nations?.map((item) => {
                return { value: item.id, label: item.name };
              }) || []
            }
            stakeholder_partnerships={
              codes?.funding_source?.map((item) => {
                return { value: item.name, label: item.name };
              }) || []
            }
          />
        ),
        stepValues: ProjectFundingFormInitialValues,
        stepValidation: ProjectFundingFormYupSchema
      }
    ]);
  }, [codes, stepForms]);

  /**
   * Return true if there exists at least 1 permit, which has been marked as having conducted sampling, false otherwise.
   *
   * @param {IProjectPermitForm} permitFormValues
   * @return {boolean} {boolean}
   */
  const isAtLeastOnePermitMarkedSamplingConducted = (permitFormValues: IProjectPermitForm): boolean => {
    return permitFormValues?.permits?.some((permitItem) => permitItem.sampling_conducted === 'true');
  };

  const updateSteps = (values: any) => {
    setStepForms((currentStepForms) => {
      let updatedStepForms = [...currentStepForms];
      updatedStepForms[activeStep].stepValues = values;
      console.log(updatedStepForms);
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
    setOpenCancelDialog(true);
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

  /**
   * Handle creation of partial or full projects.
   */
  const handleSubmit = async () => {
    try {
      const coordinatorData = stepForms[0].stepValues as IProjectCoordinatorForm;
      const permitData = stepForms[1].stepValues as IProjectPermitForm;
      const generalData = stepForms[2].stepValues as IProjectDetailsForm;
      const objectivesData = stepForms[3].stepValues as IProjectObjectivesForm;
      const locationData = stepForms[4].stepValues as IProjectLocationForm;
      const speciesData = stepForms[5].stepValues as IProjectSpeciesForm;
      const fundingData = stepForms[6].stepValues as IProjectFundingForm;

      if (!isAtLeastOnePermitMarkedSamplingConducted(permitData)) {
        await createPartialProject({
          coordinator: coordinatorData,
          permit: permitData
        });
      } else {
        await createProject({
          coordinator: coordinatorData,
          permit: permitData,
          project: generalData,
          objectives: objectivesData,
          location: locationData,
          species: speciesData,
          funding: fundingData
        });
      }
    } catch (error) {
      showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
    }
  };

  /**
   * Creates a new partial-project record
   *
   * @param {IPartialProjectPostObject} partialProjectPostObject
   * @return {*}
   */
  const createPartialProject = async (partialProjectPostObject: IPartialProjectPostObject) => {
    // TODO update this api call
    const response = await biohubApi.createPartialProject(partialProjectPostObject);

    if (!response || !response.id) {
      showErrorDialog({ dialogError: 'The response from the server was null.' });
      return;
    }

    history.push(`/projects/${response.id}`);
  };

  /**
   * Creates a new project record
   *
   * @param {IProjectPostObject} projectPostObject
   * @return {*}
   */
  const createProject = async (projectPostObject: IProjectPostObject) => {
    const response = await biohubApi.createProject(projectPostObject);

    if (!response || !response.id) {
      showErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
      return;
    }

    history.push(`/projects/${response.id}`);
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setOpenErrorDialogProps({ ...openErrorDialogProps, ...textDialogProps, open: true });
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
              <Typography variant="subtitle2">{stepForms[index].stepSubTitle}</Typography>
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

  return (
    <>
      <YesNoDialog
        dialogTitle={CreateProjectI18N.cancelTitle}
        dialogText={CreateProjectI18N.cancelText}
        open={openCancelDialog}
        onClose={handleYesNoDialogClose}
        onNo={handleDialogNo}
        onYes={handleDialogYes}
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
          <Box mb={2}>
            <Typography variant="h1">Create Project</Typography>
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
