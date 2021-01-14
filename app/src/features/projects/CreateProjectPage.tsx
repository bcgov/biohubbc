import {
  Box,
  Button,
  CircularProgress,
  Container,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import YesNoDialog from 'components/dialog/YesNoDialog';
import FormContainer from 'components/form/FormContainer';
import { CreateProject } from 'constants/i18n';
import {
  fundingAgencyTemplate,
  projectFundingAgencyTemplate,
  projectProponentTemplate,
  projectTemplate
} from 'constants/project-templates';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { stripOutKeysAndFlatten } from 'utils/JsonUtils';
import { populateTemplateWithCodes } from 'utils/TemplateUtils';

export interface ICreateProjectStep {
  stepTitle: string;
  stepSubTitle?: string;
  stepContent: any;
}

export interface IFormStepState {
  formTemplate: any;
  formData: any;
  formValid: boolean;
}

const useStyles = makeStyles((theme) => ({
  stepper: {
    backgroundColor: 'transparent'
  },
  actionsContainer: {
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
  const history = useHistory();

  const biohubApi = useBiohubApi();

  const classes = useStyles();

  const [isLoadingCodes, setIsLoadingCodes] = useState(true);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);

  // Tracks the current stepper step
  const [activeStep, setActiveStep] = useState(0);

  // Whether or not to show the 'Are you sure you want to cancel' dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);

  // Tracks various pieces of state for each form
  const [formStepState, setFormStepState] = useState<IFormStepState[]>([
    { formTemplate: projectTemplate, formData: null, formValid: false },
    { formTemplate: projectProponentTemplate, formData: null, formValid: false },
    { formTemplate: fundingAgencyTemplate, formData: null, formValid: false },
    { formTemplate: projectFundingAgencyTemplate, formData: null, formValid: false }
  ]);

  // Codes used in form steps
  const [codes, setCodes] = useState(null);

  // Steps for the create project workflow
  const [steps, setSteps] = useState<ICreateProjectStep[]>([]);

  // Get code sets
  useEffect(() => {
    const getAllCodes = async () => {
      const response = await biohubApi.getAllCodes();

      if (!response) {
        // TODO error handling/user messaging - Cant create a project if requried code sets fail to fetch
      }

      setCodes(() => {
        setIsLoadingCodes(false);

        return response;
      });
    };

    if (isLoadingCodes) {
      getAllCodes();
    }
  }, [biohubApi, isLoadingCodes]);

  // Populate template `x-enum-code` enums from code sets
  useEffect(() => {
    const addCodesToFormStepTemplates = () => {
      setFormStepState((currentState) => {
        setIsLoadingTemplates(false);

        // For each form step state, traverse each template and populate any matching code set enums
        return currentState.map((stepState: IFormStepState) => {
          const updatedFormTemplate = populateTemplateWithCodes(codes, stepState.formTemplate);
          return { ...stepState, formTemplate: updatedFormTemplate };
        });
      });
    };

    if (!isLoadingCodes && isLoadingTemplates) {
      addCodesToFormStepTemplates();
    }
  }, [isLoadingCodes, isLoadingTemplates, codes]);

  // Define steps
  useEffect(() => {
    const getFormStep = (index: number) => {
      return (
        <FormContainer
          record={formStepState[index].formData}
          template={formStepState[index].formTemplate}
          onFormChange={(event) => {
            setFormStepState((currentFormStepState) => {
              const newFormStepState = [...currentFormStepState];
              newFormStepState[index] = {
                ...newFormStepState[index],
                formData: event.formData,
                formValid: !event.errors.length
              };
              return newFormStepState;
            });
          }}
        />
      );
    };

    const setFormSteps = () => {
      setSteps([
        {
          stepTitle: 'Project Details',
          stepSubTitle: 'General information and details about this project',
          stepContent: getFormStep(0)
        },
        {
          stepTitle: 'Project Coordinator',
          stepSubTitle: 'Enter contact details for the project coordinator',
          stepContent: getFormStep(1)
        },
        {
          stepTitle: 'Project Agency',
          stepContent: getFormStep(2)
        },
        {
          stepTitle: 'Project Funding',
          stepSubTitle: 'Specify funding agencies for the project',
          stepContent: getFormStep(3)
        }
      ]);
    };

    if (!isLoadingCodes && !isLoadingTemplates) {
      setFormSteps();
    }
  }, [isLoadingCodes, isLoadingTemplates, formStepState]);

  const handleCancel = () => {
    setOpenCancelDialog(true);
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    try {
      const projectData = stripOutKeysAndFlatten(formStepState[0].formData);
      const proponentData = stripOutKeysAndFlatten(formStepState[1].formData);
      const agencyData = stripOutKeysAndFlatten(formStepState[2].formData);
      const fundingData = stripOutKeysAndFlatten(formStepState[3].formData);

      const projectPostObject = {
        project: projectData,
        proponent: proponentData,
        agency: agencyData,
        funding: fundingData
      };

      const response = await biohubApi.createProject(projectPostObject);

      if (!response || !response.id) {
        // TODO error handling/user messaging
      }

      const createdProjectID: number = response.id;

      history.push(`/projects/${createdProjectID}`);
    } catch (error) {
      // TODO error handling/user messaging
      console.log('Create project error', error);
    }
  };

  const handleDialogClose = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogNo = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogYes = () => {
    history.goBack();
  };

  if (isLoadingCodes || isLoadingTemplates || !steps?.length) {
    return <CircularProgress />;
  }

  return (
    <>
      <YesNoDialog
        dialogTitle={CreateProject.dialogTitle}
        dialogText={CreateProject.dialogText}
        open={openCancelDialog}
        onClose={handleDialogClose}
        onNo={handleDialogNo}
        onYes={handleDialogYes}
      />
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
              {steps.map((step, stepIndex) => (
                <Step key={step.stepTitle}>
                  <StepLabel>
                    <Typography variant="h4">{step.stepTitle}</Typography>
                    <Typography variant="h6">{step.stepSubTitle}</Typography>
                  </StepLabel>
                  <StepContent>
                    {step.stepContent}
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
                          onClick={handleBack}
                          className={classes.actionButton}>
                          <Typography variant="body1">Previous</Typography>
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={!formStepState[stepIndex].formValid}
                          onClick={handleNext}
                          className={classes.actionButton}>
                          <Typography variant="body1">Next</Typography>
                        </Button>
                      </Box>
                    </Box>
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
                    <Button variant="contained" onClick={handleBack} className={classes.actionButton}>
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
