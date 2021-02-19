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
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import YesNoDialog from 'components/dialog/YesNoDialog';
import FormContainer from 'components/form/FormContainer';
import { CreateProjectI18N } from 'constants/i18n';
import {
  fundingAgencyTemplate,
  projectCoordinatorTemplate,
  projectFundingAgencyTemplate,
  projectSpeciesTemplate,
  projectTemplate
} from 'constants/project-templates';
import { useBiohubApi } from 'hooks/useBioHubApi';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import { autoParseCustomValidators, getCustomValidator } from 'rjsf/business-rules/customValidation';
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

  // Tracks various pieces of state for each form
  const [formStepState, setFormStepState] = useState<IFormStepState[]>([
    { formTemplate: projectTemplate, formData: null },
    { formTemplate: projectCoordinatorTemplate, formData: null },
    { formTemplate: fundingAgencyTemplate, formData: null },
    { formTemplate: projectSpeciesTemplate, formData: null },
    { formTemplate: projectFundingAgencyTemplate, formData: null }
  ]);

  const [formRefs, setFormRefs] = useState<any[]>([null, null, null, null]);

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
    const handleSaveAndNext = (event: any) => {
      setFormStepState((currentFormStepState) => {
        const newFormStepState = [...currentFormStepState];
        newFormStepState[activeStep] = {
          ...newFormStepState[activeStep],
          formData: event.formData
        };

        return newFormStepState;
      });

      goToNextStep();
    };

    const getFormStep = (index: number) => {
      return (
        <FormContainer
          record={formStepState[index].formData}
          template={formStepState[index].formTemplate}
          setFormRef={(formRef) => {
            // Save a reference to the form, which will be used for triggering validation, and getting information about
            // the state of the form.
            setFormRefs((currentFormRefs) => {
              const newFormRefs = [...currentFormRefs];
              newFormRefs[index] = formRef;
              return newFormRefs;
            });
          }}
          customValidation={getCustomValidator(autoParseCustomValidators(formStepState[index].formTemplate))}
          customErrorTransformer={getCustomErrorTransformer()}
          onFormSubmitSuccess={handleSaveAndNext}
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
          stepTitle: 'Project Species',
          stepContent: getFormStep(3)
        },
        {
          stepTitle: 'Project Funding',
          stepSubTitle: 'Specify funding agencies for the project',
          stepContent: getFormStep(4)
        }
      ]);
    };

    if (!isLoadingCodes && !isLoadingTemplates) {
      setFormSteps();
    }
  }, [isLoadingCodes, isLoadingTemplates, formStepState, activeStep]);

  const handleCancel = () => {
    setOpenCancelDialog(true);
  };

  /**
   * Submit the form, which will trigger the validation.
   *
   * If the validation fails, the `onFormError` prop will be called, if one was provided to the FormContainer.
   * If the validation passes, the `onFormSubmitSuccess` prop will be called, if one was provided to the FormContainer.
   */
  const handleNext = () => {
    formRefs[activeStep].submit();
  };

  /**
   * Save the form data, and go to the previous step.
   */
  const handleSaveAndBack = () => {
    setFormStepState((currentFormStepState) => {
      const newFormStepState = [...currentFormStepState];
      newFormStepState[activeStep] = {
        ...newFormStepState[activeStep],
        formData: formRefs[activeStep].state.formData
      };

      return newFormStepState;
    });

    goToPreviousStep();
  };

  const goToNextStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const goToPreviousStep = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  /**
   * Handle project creation.
   *
   * Format the data to match the API request, and send to the API.
   */
  const handleSubmit = async () => {
    try {
      const projectData = stripOutKeysAndFlatten(formStepState[0].formData);
      const coordinatorData = stripOutKeysAndFlatten(formStepState[1].formData);
      const agencyData = stripOutKeysAndFlatten(formStepState[2].formData);
      const speciesData = stripOutKeysAndFlatten(formStepState[3].formData);
      const fundingData = stripOutKeysAndFlatten(formStepState[4].formData);

      const projectPostObject = {
        project: { ...projectData, ...coordinatorData },
        agency: agencyData,
        species: speciesData,
        funding: fundingData
      };

      const response = await biohubApi.createProject(projectPostObject);

      if (!response || !response.id) {
        showErrorDialog({ dialogError: 'The response from the server was null, or did not contain a project ID.' });
        return;
      }

      const createdProjectID: number = response.id;

      history.push(`/projects/${createdProjectID}`);
    } catch (error) {
      showErrorDialog({ ...((error?.message && { dialogError: error.message }) || {}) });
    }
  };

  const handleYesNoDialogClose = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogNo = () => {
    setOpenCancelDialog(false);
  };

  const handleDialogYes = () => {
    history.goBack();
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setOpenErrorDialogProps({ ...openErrorDialogProps, ...textDialogProps, open: true });
  };

  if (isLoadingCodes || isLoadingTemplates || !steps?.length) {
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
                          onClick={handleSaveAndBack}
                          className={classes.actionButton}>
                          <Typography variant="body1">Previous</Typography>
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
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
