import HotTable from '@handsontable/react';
import Box from '@material-ui/core/Box';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { Formik, FormikProps } from 'formik';
import React, { useRef, useState, useContext, useCallback, useEffect } from 'react';
import BlockObservationForm, { BlockObservationInitialValues } from './components/BlockObservationForm';
import { Prompt, useHistory, useParams } from 'react-router';
import { DialogContext } from 'contexts/dialogContext';
import { AddBlockObservationI18N } from 'constants/i18n';
import * as History from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import CircularProgress from '@material-ui/core/CircularProgress';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { ICreateBlockObservationPostRequest } from 'interfaces/useObservationApi.interface';
import moment from 'moment';
import { APIError } from 'hooks/api/useAxios';
import {
  //ErrorDialog,
  IErrorDialogProps
} from 'components/dialog/ErrorDialog';

const useStyles = makeStyles(() => ({
  breadCrumbLink: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer'
  },
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

const BlockObservationPage = () => {
  const classes = useStyles();
  const urlParams = useParams();
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const dialogContext = useContext(DialogContext);

  const hotRef = useRef<HotTable>(null);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));

  // Ability to bypass showing the 'Are you sure you want to cancel' dialog
  const [enableCancelCheck, setEnableCancelCheck] = useState(true);
  const [tableData] = useState<any[][]>([[, , , , , , , , , , , , , ,]]);
  const [initialValues] = useState(BlockObservationInitialValues);

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [surveyWithDetails, setSurveyWithDetails] = useState<IGetSurveyForViewResponse | null>(null);

  const defaultErrorDialogProps = {
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
  };

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(projectId);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, urlParams]);

  const getSurvey = useCallback(async () => {
    const surveyWithDetailsResponse = await biohubApi.survey.getSurveyForView(projectId, surveyId);

    if (!surveyWithDetailsResponse) {
      return;
    }
    setSurveyWithDetails(surveyWithDetailsResponse);
  }, [biohubApi.survey, urlParams]);

  useEffect(() => {
    if (isLoadingProject && !projectWithDetails) {
      getProject();
      setIsLoadingProject(false);
    }
  }, [isLoadingProject, projectWithDetails, getProject]);

  useEffect(() => {
    if (isLoadingSurvey && !surveyWithDetails) {
      getSurvey();
      setIsLoadingSurvey(false);
    }
  }, [isLoadingSurvey, surveyWithDetails, getSurvey]);

  const defaultCancelDialogProps = {
    dialogTitle: AddBlockObservationI18N.cancelTitle,
    dialogText: AddBlockObservationI18N.cancelText,
    open: false,
    onClose: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onNo: () => {
      dialogContext.setYesNoDialog({ open: false });
    },
    onYes: () => {
      dialogContext.setYesNoDialog({ open: false });
      history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
    }
  };

  const handleCancel = () => {
    dialogContext.setYesNoDialog(defaultCancelDialogProps);
    history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
  };

  /**
   * Intercepts all navigation attempts (when used with a `Prompt`).
   *
   * Returning true allows the navigation, returning false prevents it.
   *
   * @param {History.Location} location
   * @return {*}
   */
  const handleLocationChange = (location: History.Location, action: History.Action) => {
    if (!dialogContext.yesNoDialogProps.open) {
      // If the cancel dialog is not open: open it
      dialogContext.setYesNoDialog({
        ...defaultCancelDialogProps,
        onYes: () => {
          dialogContext.setYesNoDialog({ open: false });
          history.push(location.pathname);
        },
        open: true
      });
      return false;
    }

    // If the cancel dialog is already open and another location change action is triggered: allow it
    return true;
  };

  if (!projectWithDetails || !surveyWithDetails) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const handleSaveAndExit = async (values: ICreateBlockObservationPostRequest) => {
    if (!formikRef?.current) {
      return;
    }

    const postData: any = {
      block_name: formikRef.current.values.block_name,
      start_datetime: moment(formikRef.current.values.date + ' ' + formikRef.current.values.start_time).toISOString(),
      end_datetime: moment(formikRef.current.values.date + ' ' + formikRef.current.values.end_time).toISOString(),
      observation_count: Math.floor(Math.random() * 50) + 1,
      observation_data: {
        metaData: formikRef.current.values,
        tableData: {
          data: tableData
        }
      }
    };

    try {
      const response = await biohubApi.observation.createBlockObservation(projectId, surveyId, postData);

      if (!response) {
        return;
      } else {
        console.log('we have a successful entry');
        setEnableCancelCheck(false);
        history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
      }
    } catch (error) {
      console.log('there is an error');
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  return (
    <>
      <Prompt when={enableCancelCheck} message={handleLocationChange} />
      <Box my={3}>
        <Container maxWidth="xl">
          <Box mb={3}>
            <Breadcrumbs>
              <Link
                color="primary"
                onClick={() => history.push('/projects')}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">Projects</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/projects/${projectId}/surveys`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{projectWithDetails.project.project_name}</Typography>
              </Link>
              <Link
                color="primary"
                onClick={() => history.push(`/projects/${projectId}/surveys/${surveyId}/observations`)}
                aria-current="page"
                className={classes.breadCrumbLink}>
                <Typography variant="body2">{surveyWithDetails.survey_details.survey_name}</Typography>
              </Link>
              <Typography variant="body2">Add Block Observation</Typography>
            </Breadcrumbs>
          </Box>
          <Box mb={3}>
            <Typography data-testid="block-observation-heading" variant="h1">
              Add Block Observation
            </Typography>
          </Box>
          <Box mb={3}>
            <Typography variant="body1">
              Lorem Ipsum dolor sit amet, consecteur, Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit
              amet, consecteur. Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet, consecteur
            </Typography>
          </Box>
          <Box display="block">
            <Formik
              innerRef={formikRef}
              initialValues={initialValues}
              enableReinitialize={true}
              validateOnBlur={false}
              validateOnChange={false}
              onSubmit={() => {}}>
              <BlockObservationForm tableRef={hotRef} tableData={tableData} />
            </Formik>
            <Box mt={2} mb={6} display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={(values: any) => handleSaveAndExit(values)}
                className={classes.actionButton}>
                Save and Exit
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                onClick={() => {
                  console.log('Save and next clicked');
                }}
                className={classes.actionButton}>
                Save and Next Block
              </Button>
              <Button variant="outlined" color="primary" onClick={handleCancel} className={classes.actionButton}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default BlockObservationPage;
