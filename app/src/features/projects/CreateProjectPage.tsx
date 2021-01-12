import {
  Box,
  Button,
  Container,
  makeStyles,
  Paper,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  Typography
} from '@material-ui/core';
import EditFormControlsComponent from 'components/form/EditFormControlsComponent';
import FormContainer from 'components/form/FormContainer';
import {
  projectAgencyTemplate,
  projectFundingAgencyTemplate,
  projectProponentTemplate,
  projectTemplate
} from 'constants/project-templates';
import React from 'react';
import { useHistory } from 'react-router';

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

  const classes = useStyles();

  const [activeStep, setActiveStep] = React.useState(0);

  function getSteps() {
    return ['Project Details', 'Project Funding', 'Project Agency', 'Project Proponent'];
  }

  function getStepContent(step: any) {
    switch (step) {
      case 0:
        return <FormContainer template={projectTemplate} formControlsComponent={EditFormControlsComponent} />;
      case 1:
        return (
          <FormContainer template={projectFundingAgencyTemplate} formControlsComponent={EditFormControlsComponent} />
        );
      case 2:
        return <FormContainer template={projectAgencyTemplate} formControlsComponent={EditFormControlsComponent} />;
      case 3:
        return <FormContainer template={projectProponentTemplate} formControlsComponent={EditFormControlsComponent} />;
      default:
        return 'Unknown step';
    }
  }

  const steps = getSteps();

  const navigateToProjectsPage = () => {
    history.push('/projects');
  };

  const handleCancel = () => {
    // TODO are you sure messaging?
    navigateToProjectsPage();
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = () => [];

  return (
    <Box my={3}>
      <Container>
        <Box mb={3}>
          <Typography variant="h2">Create Project</Typography>
        </Box>
        <Box>
          <Stepper activeStep={activeStep} orientation="vertical" className={classes.stepper}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <Typography variant="h3">{label}</Typography>
                </StepLabel>
                <StepContent>
                  {getStepContent(index)}
                  <Box display="flex" justifyContent="space-between" className={classes.actionsContainer}>
                    <Box>
                      <Button variant="contained" onClick={handleCancel} className={classes.actionButton}>
                        Cancel
                      </Button>
                    </Box>
                    <Box>
                      <Button
                        disabled={activeStep === 0}
                        variant="contained"
                        onClick={handleBack}
                        className={classes.actionButton}>
                        Previous
                      </Button>
                      <Button variant="contained" color="primary" onClick={handleNext} className={classes.actionButton}>
                        Next
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
                    Cancel
                  </Button>
                </Box>
                <Box>
                  <Button variant="contained" onClick={handleBack} className={classes.actionButton}>
                    Previous
                  </Button>
                  <Button variant="contained" color="primary" onClick={handleSubmit} className={classes.actionButton}>
                    Create Project
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default CreateProjectPage;
