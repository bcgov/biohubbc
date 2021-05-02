import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { useHistory } from 'react-router';
//import ArrowBack from '@material-ui/icons/ArrowBack';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useParams } from 'react-router';
import React, { useCallback, useEffect, useState } from 'react';

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
  const urlParams = useParams();
  //const location = useLocation();

  const biohubApi = useBiohubApi();

  const classes = useStyles();

  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);

  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();

  const history = useHistory();

  const handleCancel = () => {
    history.push(`/projects/${projectWithDetails?.id}/surveys`);
  };

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        // TODO error handling/messaging
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [urlParams, biohubApi.codes, isLoadingCodes, codes]);

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(urlParams['id']);

    if (!projectWithDetailsResponse) {
      // TODO error handling/messaging
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  useEffect(() => {
    if (!isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(true);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  if (!codes || !projectWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box my={3}>
      <Container maxWidth="md">
        <Box mb={3}>
          <Breadcrumbs>
            <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
              <Typography variant="body2">{projectWithDetails.project.project_name} / Create Survey</Typography>
            </Link>
          </Breadcrumbs>
        </Box>

        <Box mb={3}>
          <Typography variant="h1">Create Survey</Typography>
        </Box>
        <Box mb={5}>
          <Typography variant="body1">
            Lorem Ipsum dolor sit amet, consecteur, Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet,
            consecteur. Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet, consecteur
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateSurveyPage;
