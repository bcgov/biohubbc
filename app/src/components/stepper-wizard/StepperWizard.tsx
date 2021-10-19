import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
//import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { mdiAlertCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Formik } from 'formik';
import React, { ReactElement, useCallback } from 'react';

const useStyles = makeStyles((theme) => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  stepTitle: {
    marginBottom: 0
  },
  stepDescription: {
    maxWidth: '90ch'
  },
  stepper: {
    width: '280px',
    background: 'transparent'
  },
  [theme.breakpoints.down('md')]: {
    stepperContainer: {
      display: 'none'
    }
  }
}));

export interface IStepperWizardStep {
  stepTitle?: string;
  stepSubTitle?: string;
  stepContent: ReactElement;
  stepInitialValues: any;
  stepYupSchema?: object;
  isValid: boolean;
  isTouched: boolean;
}

export interface IStepperWizardProps {
  activeStep: number;
  steps: IStepperWizardStep[];
  innerRef: any;
  onNext: () => void;
  onPrevious: () => void;
  onSubmit: () => void;
  onSubmitLabel: string;
  onCancel: () => void;
  onChangeStep: (stepIndex: number) => void;
}

const StepperWizard: React.FC<IStepperWizardProps> = (props) => {
  const { activeStep, steps, innerRef, onChangeStep, onNext, onPrevious, onSubmit, onSubmitLabel, onCancel } = props;

  const classes = useStyles();

  const showPreviousButton = activeStep > 0;
  const showNextButton = activeStep < steps.length - 1;

  const getStepperWizardControls = () => {
    return (
      <>
        <Box>
          {showPreviousButton && (
            <Button
              startIcon={<ArrowBack color="primary" fontSize="small" />}
              variant="outlined"
              color="primary"
              onClick={onPrevious}
              className={classes.actionButton}
              data-testid="stepper_previous">
              Previous
            </Button>
          )}
        </Box>
        <Box>
          {showNextButton && (
            <Button
              endIcon={<ArrowForward fontSize="small" />}
              type="submit"
              variant="contained"
              color="primary"
              onClick={onNext}
              className={classes.actionButton}
              data-testid="stepper_next">
              Next
            </Button>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={onSubmit}
            className={classes.actionButton}
            data-testid="stepper_submit">
            {onSubmitLabel}
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={onCancel}
            className={classes.actionButton}
            data-testid="stepper_cancel">
            Cancel
          </Button>
        </Box>
      </>
    );
  };

  const getStepperWizardLabels = () => {
    return steps.map((step, index) => {
      return (
        <Step key={index}>
          <StepLabel
            onClick={() => onChangeStep?.(index)}
            StepIconProps={{
              error: !step.isValid && step.isTouched,
              completed: step.isValid && step.isTouched,
              ...(!step.isValid &&
                step.isTouched && {
                  icon: <Icon path={mdiAlertCircle} className="MuiSvgIcon-root MuiStepIcon-root Mui-error" /> || {}
                })
            }}>
            <Typography variant="body2">{step.stepTitle}</Typography>
          </StepLabel>
        </Step>
      );
    });
  };

  const getStepperWizardContent = useCallback(() => {
    if (!steps?.length) {
      return;
    }

    return (
      <>
        <Box mb={3}>
          <Typography variant="h2" className={classes.stepTitle}>
            {steps[activeStep].stepTitle}
          </Typography>
        </Box>

        <Typography color="textSecondary" className={classes.stepDescription}>
          {steps[activeStep].stepSubTitle}
        </Typography>

        <Box>
          <Box mt={5}>
            <Formik
              key={steps[activeStep].stepTitle}
              innerRef={innerRef}
              enableReinitialize={true}
              initialValues={steps[activeStep].stepInitialValues}
              validationSchema={steps[activeStep].stepYupSchema}
              validateOnBlur={true}
              validateOnChange={false}
              onSubmit={() => {
                // do nothing
              }}>
              {steps[activeStep].stepContent}
            </Formik>
          </Box>
        </Box>
      </>
    );
  }, [activeStep, innerRef, steps, classes.stepTitle, classes.stepDescription]);

  return (
    <Box display="flex" component={Paper}>
      <Box className={classes.stepperContainer} display="flex">
        <Box p={5} pb={7}>
          <Stepper nonLinear orientation="vertical" activeStep={activeStep} className={classes.stepper}>
            {getStepperWizardLabels()}
          </Stepper>
        </Box>

        <Box>
          <Divider orientation="vertical" />
        </Box>
      </Box>

      <Box display="flex" flexDirection="column" flex="1 1 auto" p={5}>
        <Box flex="1 1 auto">{getStepperWizardContent()}</Box>
        <Box pt={7} pb={5}>
          <Divider orientation="horizontal" />
        </Box>
        <Box display="flex" justifyContent="space-between">
          {getStepperWizardControls()}
        </Box>
      </Box>
    </Box>
  );
};

export default StepperWizard;
