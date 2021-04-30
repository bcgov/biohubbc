import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router';
import ArrowBack from '@material-ui/icons/ArrowBack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';

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

/**
 * Page to display user management data/functionality.
 *
 * @return {*}
 */
const CreateSurveyPage: React.FC = () => {
  const classes = useStyles();

  const history = useHistory();
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const handleCancel = () => {
    history.push(`/projects/${projectWithDetails?.id}/surveys`);
  };

  return (
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
        <Container maxWidth="xl">
          <Box mb={5} display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h1">Create Survey Page</Typography>
          </Box>
        </Container>
      </Container>
    </Box>
  );
};

export default CreateSurveyPage;
