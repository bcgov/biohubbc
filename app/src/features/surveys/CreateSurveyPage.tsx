import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import CreateSurveySection from './CreateSurveySection';

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
  surveySection: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(5),

    '&:last-child': {
      marginBottom: 0
    },
    '&:first-child': {
      marginTop: 0
    }
  },
  sectionDivider: {
    height: '1px'
  }
}));

/**
 * Page to create a survey.
 *
 * @return {*}
 */
const CreateSurveyPage = () => {
  const urlParams = useParams();
  const classes = useStyles();

  const biohubApi = useBiohubApi();

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
      <Container maxWidth="lg">
        <Box mb={3}>
          <Breadcrumbs>
            <Link color="primary" onClick={handleCancel} aria-current="page" className={classes.breadCrumbLink}>
              <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
            </Link>
            <Typography variant="body2">Create Survey</Typography>
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
        <Box component={Paper} display="block">
          <CreateSurveySection
            codes={codes}
            title="Title 1"
            summary="Summary 1"
            component={
              <Box>
                To be replaced with real section content; To be replaced with real section content; To be replaced with
                real section content; To be replaced with real section content;{' '}
              </Box>
            }
          />
          <Divider className={classes.sectionDivider} />
          <CreateSurveySection
            codes={codes}
            title="Title 2"
            summary="Summary 2"
            component={
              <Box>
                To be replaced with real section content; To be replaced with real section content; To be replaced with
                real section content; To be replaced with real section content;{' '}
              </Box>
            }
          />
          <Divider className={classes.sectionDivider} />
          <Box p={3} display="flex" justifyContent="flex-end">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={() => {}}
              className={classes.actionButton}>
              Save and Exit
            </Button>
            <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CreateSurveyPage;
