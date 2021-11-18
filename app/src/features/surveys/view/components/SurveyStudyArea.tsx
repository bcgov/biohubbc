import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { mdiChevronRight, mdiPencilOutline } from '@mdi/js';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import Icon from '@mdi/react';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import OccurrenceFeatureGroup from 'components/map/OccurrenceFeatureGroup';
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
import {
  IGetSurveyForViewResponse,
  IUpdateSurveyRequest,
  UPDATE_GET_SURVEY_ENTITIES
} from 'interfaces/useSurveyApi.interface';
import React, { useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ISurveyStudyAreaProps {
  surveyForViewData: IGetSurveyForViewResponse;
  projectForViewData: IGetProjectForViewResponse;
  refresh: () => void;
}

/**
 * Study area content for a survey.
 *
 * @return {*}
 */
const SurveyStudyArea: React.FC<ISurveyStudyAreaProps> = (props) => {
  const biohubApi = useBiohubApi();

  const {
    projectForViewData,
    surveyForViewData: { survey_details },
    refresh
  } = props;

  const surveyGeometry = survey_details?.geometry;

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [surveyDetailsDataForUpdate, setSurveyDetailsDataForUpdate] = useState<IUpdateSurveyRequest>(null as any);
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

  useEffect(() => {
    const nonEditableGeometriesResult = surveyGeometry.map((geom: Feature) => {
      return { feature: geom };
    });

    if (!survey_details.occurrence_submission_id) {
      setBounds(calculateUpdatedMapBounds(surveyGeometry));
    }

    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [surveyGeometry, survey_details.occurrence_submission_id]);

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
    let studyAreaResponseData;

    try {
      const response = await biohubApi.survey.getSurveyForUpdate(projectForViewData.id, survey_details?.id, [
        UPDATE_GET_SURVEY_ENTITIES.survey_details
      ]);

      if (!response) {
        showErrorDialog({ open: true });
        return;
      }

      studyAreaResponseData = response;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setSurveyDetailsDataForUpdate(studyAreaResponseData);
    setStudyAreaFormData({
      ...StudyAreaInitialValues,
      survey_area_name:
        (studyAreaResponseData.survey_details && studyAreaResponseData.survey_details.survey_area_name) || '',
      geometry: studyAreaResponseData.survey_details?.geometry || []
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IStudyAreaForm) => {
    try {
      if (surveyDetailsDataForUpdate.survey_details) {
        const surveyData = {
          survey_details: {
            ...surveyDetailsDataForUpdate.survey_details,
            permit_type: '', // TODO 20211108: currently permit insert vs update is dictated by permit_type (needs fixing/updating)
            survey_area_name: values.survey_area_name,
            geometry: values.geometry
          }
        };

        await biohubApi.survey.updateSurvey(projectForViewData.id, survey_details.id, surveyData);
      }
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

        <Box mt={2} height={350}>
          <MapContainer
            mapId="survey_study_area_map"
            hideDrawControls={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
            additionalLayers={
              survey_details.occurrence_submission_id
                ? [<OccurrenceFeatureGroup occurrenceSubmissionId={survey_details.occurrence_submission_id} />]
                : undefined
            }
          />
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
