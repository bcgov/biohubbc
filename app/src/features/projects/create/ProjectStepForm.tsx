import { Box, Divider, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import React, { ReactElement } from 'react';

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

export interface IProjectFormStep {
  stepTitle: string;
  stepSubTitle: string;
  stepContent: ReactElement;
}

/**
 * Form for creating a new project.
 *
 * @return {*}
 */
const ProjectStepForm: React.FC<IProjectFormStep> = (props) => {
  const { stepTitle, stepSubTitle, stepContent } = props;

  const classes = useStyles();

  return (
    <Box display="flex" flexDirection="column" flex="1 1 auto" p={5}>
      <Box flex="1 1 auto">
        <Box mb={3}>
          <Typography variant="h2" className={classes.stepTitle}>
            {stepTitle}
          </Typography>
        </Box>

        <Typography color="textSecondary" className={classes.stepDescription}>
          {stepSubTitle}
        </Typography>

        <Box>
          <Box mt={5}>{stepContent}</Box>
        </Box>
      </Box>
      <Box pt={4}>
        <Divider orientation="horizontal" />
      </Box>
    </Box>
  );
};

export default ProjectStepForm;
