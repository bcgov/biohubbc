import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { mdiChevronRight, mdiPencilOutline, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import OccurrenceFeatureGroup from 'components/map/OccurrenceFeatureGroup';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditSurveyStudyAreaI18N } from 'constants/i18n';
import StudyAreaForm, {
  IStudyAreaForm,
  StudyAreaInitialValues,
  StudyAreaYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ISurveyStudyAreaProps {
  surveyForViewData: IGetSurveyForViewResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

const useStyles = makeStyles(() =>
  createStyles({
    zoomToBoundaryExtentBtn: {
      padding: '3px',
      borderRadius: '4px',
      background: '#ffffff',
      color: '#000000',
      border: '2px solid rgba(0,0,0,0.2)',
      backgroundClip: 'padding-box',
      '&:hover': {
        backgroundColor: '#eeeeee'
      }
    }
  })
);

/**
 * Study area content for a survey.
 *
 * @return {*}
 */
const SurveyStudyArea: React.FC<ISurveyStudyAreaProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const {
    projectForViewData,
    surveyForViewData: {
      surveyData: { survey_details },
      surveySupplementaryData: { occurrence_submission }
    },
    refresh
  } = props;

  const surveyGeometry = survey_details?.geometry || [];

  const [openEditDialog, setOpenEditDialog] = useState(false);
  // const [surveyDataForUpdate, setSurveyDataForUpdate] = useState<IGetSurveyForViewResponse>(null as any);
  const [studyAreaFormData, setStudyAreaFormData] = useState<IStudyAreaForm>(StudyAreaInitialValues);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });
  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(calculateUpdatedMapBounds(surveyGeometry));
  }, [surveyGeometry]);

  useEffect(() => {
    const nonEditableGeometriesResult = surveyGeometry.map((geom: Feature) => {
      return { feature: geom };
    });

    zoomToBoundaryExtent();

    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [surveyGeometry, occurrence_submission.id, zoomToBoundaryExtent]);

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditSurveyStudyAreaI18N.editErrorTitle,
    dialogText: EditSurveyStudyAreaI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const handleDialogEditOpen = async () => {
    let surveyResponseData;

    try {
      const surveyResponse = await biohubApi.survey.getSurveyForView(projectForViewData.id, survey_details?.id);

      if (!surveyResponse) {
        showErrorDialog({ open: true });
        return;
      }

      surveyResponseData = surveyResponse;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    // setSurveyDataForUpdate(surveyResponseData);

    setStudyAreaFormData({
      location: {
        survey_area_name: surveyResponseData.surveyData.survey_details.survey_area_name,
        geometry: surveyResponseData.surveyData.survey_details.geometry
      }
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IStudyAreaForm) => {
    try {
      const surveyData = {
        location: {
          survey_area_name: values.location.survey_area_name,
          geometry: values.location.geometry,
          revision_count: survey_details.revision_count
        }
      };

      await biohubApi.survey.updateSurvey(projectForViewData.id, survey_details.id, surveyData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    refresh();
  };

  const handleDialogViewOpen = () => {
    setShowFullScreenViewMapDialog(true);
  };

  const handleClose = () => {
    setShowFullScreenViewMapDialog(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditSurveyStudyAreaI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <StudyAreaForm />,
          initialValues: studyAreaFormData,
          validationSchema: StudyAreaYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />

      <FullScreenViewMapDialog
        open={showFullScreenViewMapDialog}
        onClose={handleClose}
        map={
          <MapContainer
            mapId="project_location_form_map"
            hideDrawControls={true}
            scrollWheelZoom={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
          />
        }
        description={survey_details.survey_area_name}
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Survey'}
        mapTitle={'Study Area'}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box component={Paper} px={3} pt={1} pb={3}>
        <H2ButtonToolbar
          label="Study Area"
          buttonLabel="Edit"
          buttonTitle="Edit Study Area"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          buttonProps={{ variant: 'text' }}
          toolbarProps={{ disableGutters: true }}
        />

        <Box mt={2} height={350} position="relative">
          <MapContainer
            mapId="survey_study_area_map"
            hideDrawControls={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
            additionalLayers={
              occurrence_submission.id
                ? [
                    <OccurrenceFeatureGroup
                      projectId={projectForViewData.id}
                      occurrenceSubmissionId={occurrence_submission.id}
                    />
                  ]
                : undefined
            }
          />
          {surveyGeometry.length > 0 && (
            <Box position="absolute" top="126px" left="10px" zIndex="999">
              <IconButton
                aria-label="zoom to initial extent"
                title="Zoom to initial extent"
                className={classes.zoomToBoundaryExtentBtn}
                onClick={() => zoomToBoundaryExtent()}>
                <Icon size={1} path={mdiRefresh} />
              </IconButton>
            </Box>
          )}
        </Box>
        <Box my={3}>
          <Typography variant="body2" color="textSecondary">
            Study Area Name
          </Typography>
          <Typography variant="body1">{survey_details.survey_area_name}</Typography>
        </Box>

        <InferredLocationDetails layers={inferredLayersInfo} />

        <Box mt={3}>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogViewOpen()}
            title="Expand Location"
            aria-label="Show Expanded Location"
            endIcon={<Icon path={mdiChevronRight} size={0.875} />}>
            Show More
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default SurveyStudyArea;
