import {
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
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
  ProjectCoordinatorInitialValues,
  ProjectCoordinatorYupSchema
} from 'features/projects/components/ProjectCoordinatorForm';
import ProjectDetailsForm, {
  ProjectDetailsFormInitialValues,
  ProjectDetailsFormYupSchema
} from 'features/projects/components/ProjectDetailsForm';
import ProjectFundingForm, {
  ProjectFundingFormInitialValues,
  ProjectFundingFormYupSchema
} from 'features/projects/components/ProjectFundingForm';
import ProjectPermitForm, {
  ProjectPermitFormInitialValues,
  ProjectPermitFormYupSchema
} from 'features/projects/components/ProjectPermitForm';
import ProjectSpeciesForm, {
  ProjectSpeciesFormInitialValues,
  ProjectSpeciesFormYupSchema
} from 'features/projects/components/ProjectSpeciesForm';
import ProjectLocationForm, {
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import ProjectObjectivesForm, {
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import { Formik } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodesResponse, IProjectPostObject } from 'interfaces/useBioHubApi-interfaces';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

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
  stepper: {
    backgroundColor: 'transparent'
  },
  actionsContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  actionButton: {
    marginTop: theme.spacing(1),
    marginRight: theme.spacing(1)
  },
  finishContainer: {
    padding: theme.spacing(3),
    backgroundColor: 'transparent'
  }
}));

/**
 * Page for creating a new project.
 *
 * @return {*}
 */
const CreateProjectPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  // Tracks the current stepper step
  const [activeStep, setActiveStep] = useState(0);

  // Steps for the create project workflow
  const [steps, setSteps] = useState<ICreateProjectStep[]>([]);

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

  const [codes, setCodes] = useState<IGetAllCodesResponse>();

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

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

  // Define steps
  useEffect(() => {
    const setFormSteps = () => {
      setSteps([
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
          stepContent: <ProjectPermitForm />,
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
    };

    if (codes && !steps?.length) {
      setFormSteps();
    }
  }, [codes, steps]);

  const updateSteps = (values: any) => {
    console.log(values);

    setSteps((currentSteps) => {
      let updatedSteps = [...currentSteps];
      updatedSteps[activeStep].stepValues = values;

      console.log(updatedSteps);

      return updatedSteps;
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
   * Handle project creation.
   *
   * Format the data to match the API request, and send to the API.
   */
  const handleSubmit = async () => {
    try {
      const coordinatorData = steps[0].stepValues;
      const permitData = steps[1].stepValues;
      const generalData = steps[2].stepValues;
      const objectivesData = steps[3].stepValues;
      const locationData = steps[4].stepValues;
      const speciesData = steps[5].stepValues;
      const fundingData = steps[6].stepValues;

      const projectPostObject: IProjectPostObject = {
        coordinator: coordinatorData,
        permit: permitData,
        project: generalData,
        objectives: objectivesData,
        location: locationData,
        species: speciesData,
        funding: fundingData
      };

      const response = await biohubApi.createProject(projectPostObject);

      if (!response || !response.id) {
        showErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
        return;
      }

      history.push(`/projects/${response.id}`);
    } catch (error) {
      showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setOpenErrorDialogProps({ ...openErrorDialogProps, ...textDialogProps, open: true });
  };

  if (!steps?.length) {
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
        <Container>
          <Box mb={2}>
            <Button variant="text" color="primary" startIcon={<ArrowBack />} onClick={handleCancel}>
              <Typography variant="body1">Back to Projects</Typography>
            </Button>
          </Box>
          <Box mb={2}>
            <Typography variant="h2">Create Project</Typography>
          </Box>
          <Box>
            <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepper}>
              {steps.map((step) => (
                <Step key={step.stepTitle}>
                  <StepLabel>
                    <Typography variant="h2">{step.stepTitle}</Typography>
                    <Typography variant="subtitle2">{step.stepSubTitle}</Typography>
                  </StepLabel>
                  <StepContent>
                    <Formik
                      initialValues={step.stepValues}
                      validationSchema={step.stepValidation}
                      validateOnBlur={true}
                      validateOnChange={false}
                      onSubmit={async (values, helper) => {
                        handleSaveAndNext(values);
                      }}>
                      {(props) => (
                        <>
                          {step.stepContent}
                          <Box my={2}>
                            <Divider />
                          </Box>
                          <Box display="flex" justifyContent="space-between" className={classes.actionsContainer}>
                            <Box>
                              <Button variant="contained" onClick={handleCancel} className={classes.actionButton}>
                                <Typography variant="body1">Cancel</Typography>
                              </Button>
                            </Box>
                            <Box>
                              <Button
                                disabled={activeStep === 0}
                                variant="contained"
                                onClick={() => handleSaveAndBack(props.values)}
                                className={classes.actionButton}>
                                <Typography variant="body1">Previous</Typography>
                              </Button>
                              <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                onClick={props.submitForm}
                                className={classes.actionButton}>
                                <Typography variant="body1">Next</Typography>
                              </Button>
                            </Box>
                          </Box>
                        </>
                      )}
                    </Formik>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
            {activeStep === steps.length && (
              <Paper square elevation={0} className={classes.finishContainer}>
                <Box mb={3}>
                  <Typography variant="h3">All steps complete!</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" className={classes.actionsContainer}>
                  <Box>
                    <Button variant="contained" onClick={handleCancel} className={classes.actionButton}>
                      <Typography variant="body1">Cancel</Typography>
                    </Button>
                  </Box>
                  <Box>
                    <Button variant="contained" onClick={goToPreviousStep} className={classes.actionButton}>
                      <Typography variant="body1">previous</Typography>
                    </Button>
                    <Button variant="contained" color="primary" onClick={handleSubmit} className={classes.actionButton}>
                      <Typography variant="body1">Create Project</Typography>
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
