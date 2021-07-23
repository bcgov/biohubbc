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
import BlockObservationForm, {
  BlockObservationInitialValues,
  BlockObservationYupSchema,
  IBlockObservationForm
} from './components/BlockObservationForm';
import { Prompt, useHistory, useParams } from 'react-router';
import { DialogContext } from 'contexts/dialogContext';
import { AddBlockObservationI18N } from 'constants/i18n';
import * as History from 'history';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import CircularProgress from '@material-ui/core/CircularProgress';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import moment from 'moment';
import { APIError } from 'hooks/api/useAxios';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import Paper from '@material-ui/core/Paper';
import { validateFormFieldsAndReportCompletion } from 'utils/customValidation';
import yup from 'utils/YupSchema';
import { DATE_FORMAT, DATE_LIMIT } from 'constants/dateTimeFormats';
import { getFormattedDate } from 'utils/Utils';

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

interface IObservationWithDetails {
  data: IBlockObservationForm;
  revision_count?: number;
}

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
  const [tableData, setTableData] = useState<any[][]>([[, , , , , , , , , , , , , ,]]);

  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [isLoadingSurvey, setIsLoadingSurvey] = useState(true);
  const [isLoadingObservation, setIsLoadingObservation] = useState(true);
  const [projectWithDetails, setProjectWithDetails] = useState<IGetProjectForViewResponse | null>(null);
  const [surveyWithDetails, setSurveyWithDetails] = useState<IGetSurveyForViewResponse | null>(null);
  const [observationWithDetails, setObservationWithDetails] = useState<IObservationWithDetails>({
    data: BlockObservationInitialValues
  });

  const projectId = urlParams['id'];
  const surveyId = urlParams['survey_id'];
  const observationId = urlParams['observation_id'];

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

  const getProject = useCallback(async () => {
    const projectWithDetailsResponse = await biohubApi.project.getProjectForView(projectId);

    if (!projectWithDetailsResponse) {
      return;
    }

    setProjectWithDetails(projectWithDetailsResponse);
  }, [biohubApi.project, projectId]);

  const getSurvey = useCallback(async () => {
    const surveyWithDetailsResponse = await biohubApi.survey.getSurveyForView(projectId, surveyId);

    if (!surveyWithDetailsResponse) {
      return;
    }
    setSurveyWithDetails(surveyWithDetailsResponse);
  }, [biohubApi.survey, projectId, surveyId]);

  const getObservation = useCallback(async () => {
    const observationWithDetailsResponse = await biohubApi.observation.getObservationForUpdate(
      projectId,
      surveyId,
      observationId,
      'block'
    );

    if (!observationWithDetailsResponse || !observationWithDetailsResponse.data) {
      return;
    }

    setObservationWithDetails({
      data: observationWithDetailsResponse.data.metaData,
      revision_count: observationWithDetailsResponse.revision_count
    });
    setTableData(observationWithDetailsResponse.data.tableData.data);
  }, [biohubApi.observation, observationId, projectId, surveyId]);

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

  useEffect(() => {
    if (isLoadingObservation && observationId) {
      getObservation();
      setIsLoadingObservation(false);
    }
  }, [observationId, isLoadingObservation, observationWithDetails, getObservation]);

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

  const addupMooseData = (): number => {
    let sum = 0;
    for (let row = 0; row < tableData.length; row++) {
      for (let col = 1; col < 9; col++) {
        if (tableData[row][col]) {
          sum += col === 5 ? tableData[row][col] * 2 : col === 6 ? tableData[row][col] * 3 : tableData[row][col];
        }
      }
    }
    return sum;
  };

  const handleSaveAndExit = async () => {
    if (!formikRef?.current) {
      return;
    }

    await formikRef.current?.submitForm();

    const isValid = await validateFormFieldsAndReportCompletion(
      formikRef.current?.values,
      formikRef.current?.validateForm
    );

    if (!isValid) {
      showErrorDialog({
        dialogTitle: 'Observation Form Incomplete',
        dialogText:
          'The form is missing some required fields/sections highlighted in red. Please fill them out and try again.'
      });

      return;
    }

    const data: any = {
      observation_type: 'block',
      observation_details_data: {
        block_name: formikRef.current.values.block_name,
        start_datetime: moment(`${formikRef.current.values.date} ${formikRef.current.values.start_time}`).toISOString(),
        end_datetime: moment(`${formikRef.current.values.date} ${formikRef.current.values.end_time}`).toISOString(),
        observation_count: addupMooseData(),
        observation_data: {
          metaData: formikRef.current.values,
          tableData: {
            data: tableData
          }
        },
        revision_count: observationWithDetails.revision_count
      }
    };

    try {
      const response = !observationId
        ? await biohubApi.observation.createObservation(projectId, surveyId, data)
        : await biohubApi.observation.updateObservation(projectId, surveyId, observationId, data);

      if (!response) {
        return;
      }

      setEnableCancelCheck(false);
      history.push(`/projects/${projectId}/surveys/${surveyId}/observations`);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
    }
  };

  const formattedSurveyStartDate = getFormattedDate(
    DATE_FORMAT.ShortMediumDateFormat,
    surveyWithDetails.survey_details.start_date
  );

  const formattedSurveyEndDate = getFormattedDate(
    DATE_FORMAT.ShortMediumDateFormat,
    surveyWithDetails.survey_details.end_date
  );

  const dateHelperText = surveyWithDetails.survey_details.end_date
    ? `Observation date must be between ${formattedSurveyStartDate} and ${formattedSurveyEndDate}.`
    : `Observation date must be on or after ${formattedSurveyStartDate}.`;

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
              <Typography variant="body2">{observationId ? 'Edit' : 'Add'} Block Observation</Typography>
            </Breadcrumbs>
          </Box>
          <Box mb={3}>
            <Typography data-testid="block-observation-heading" variant="h1">
              {observationId ? 'Edit' : 'Add'} Block Observation
            </Typography>
          </Box>
          <Box mb={5}>
            <Typography variant="body1">
              Lorem Ipsum dolor sit amet, consecteur, Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit
              amet, consecteur. Lorem Ipsum dolor sit amet, consecteur. Lorem Ipsum dolor sit amet, consecteur
            </Typography>
          </Box>
          <Box pl={3} pr={3} component={Paper} display="block">
            <Formik
              innerRef={formikRef}
              initialValues={observationWithDetails.data}
              validationSchema={BlockObservationYupSchema({
                date: yup
                  .string()
                  .isValidDateString()
                  .isAfterDate(
                    surveyWithDetails.survey_details.start_date,
                    DATE_FORMAT.ShortDateFormat,
                    `Observation date cannot be before survey start date ${formattedSurveyStartDate}`
                  )
                  .isAfterDate(
                    moment(DATE_LIMIT.min).toISOString(),
                    DATE_FORMAT.ShortDateFormat,
                    `Observation date cannot be before ${DATE_LIMIT.min}`
                  )
                  .isBeforeDate(
                    surveyWithDetails.survey_details.end_date,
                    DATE_FORMAT.ShortDateFormat,
                    `Observation date cannot be after survey end date ${formattedSurveyEndDate}`
                  )
                  .isBeforeDate(
                    moment(DATE_LIMIT.max).toISOString(),
                    DATE_FORMAT.ShortDateFormat,
                    `Observation date cannot be after ${DATE_LIMIT.max}`
                  )
                  .required('Required')
              })}
              enableReinitialize={true}
              validateOnBlur={false}
              validateOnChange={false}
              onSubmit={() => {}}>
              <BlockObservationForm dateHelperText={dateHelperText} tableRef={hotRef} tableData={tableData} />
            </Formik>
            <Box mt={2} pb={3} display="flex" justifyContent="flex-end">
              {!observationId && (
                <>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    data-testid="save-and-exit-button"
                    onClick={handleSaveAndExit}
                    className={classes.actionButton}>
                    Save and Exit
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={() => console.log('add and next block functionality')}
                    className={classes.actionButton}>
                    Save and Next Block
                  </Button>
                </>
              )}
              {observationId && (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  data-testid="save-changes-button"
                  onClick={handleSaveAndExit}
                  className={classes.actionButton}>
                  Save Changes
                </Button>
              )}
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
