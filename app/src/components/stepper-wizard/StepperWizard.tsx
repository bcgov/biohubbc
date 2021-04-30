import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import Stepper from '@material-ui/core/Stepper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import { mdiAlertCircle } from '@mdi/js';
import Icon from '@mdi/react';
import { Formik } from 'formik';
import React, { ReactElement, useCallback } from 'react';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  stepTitle: {
    marginBottom: '0.45rem'
  }
}));

export interface IStepperWizardStep {
  stepTitle?: string;
  stepSubTitle?: string;
  stepContent: ReactElement;
  stepValues: any;
  stepValidation?: object;
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
              className={classes.actionButton}>
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
              className={classes.actionButton}>
              Next
            </Button>
          )}
          <Button type="submit" variant="contained" color="primary" onClick={onSubmit} className={classes.actionButton}>
            {onSubmitLabel}
          </Button>
          <Button variant="outlined" color="primary" onClick={onCancel} className={classes.actionButton}>
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
    return (
      <>
        <Box mb={3}>
          <Typography variant="h2" className={classes.stepTitle}>
            {steps[activeStep].stepTitle}
          </Typography>
          <Typography variant="subtitle1">{steps[activeStep].stepSubTitle}</Typography>
        </Box>
        <Formik
          key={steps[activeStep].stepTitle}
          innerRef={innerRef}
          enableReinitialize={true}
          initialValues={steps[activeStep].stepValues}
          validationSchema={steps[activeStep].stepValidation}
          validateOnBlur={true}
          validateOnChange={false}
          onSubmit={() => {}}>
          {steps[activeStep].stepContent}
        </Formik>
      </>
    );
  }, [activeStep, innerRef, steps, classes.stepTitle]);

  return (
    <Box display="flex">
      <Box flex="0 1 30%">
        <Stepper nonLinear activeStep={activeStep} orientation="vertical">
          {getStepperWizardLabels()}
        </Stepper>
      </Box>
      <Box>
        <Divider orientation="vertical" />
      </Box>
      <Box flex="1 0 0">
        <Box display="flex" flexDirection="column" height="100%">
          <Box flex="1 0 auto" p={3}>
            {getStepperWizardContent()}
          </Box>
          <Box py={1}>
            <Divider orientation="horizontal" />
          </Box>
          <Box display="flex" justifyContent="space-between" p={3}>
            {getStepperWizardControls()}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StepperWizard;
