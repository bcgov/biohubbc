import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
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
import InferredLocationDetails from 'components/boundary/InferredLocationDetails';
import { IInferredLayers } from 'components/boundary/InferredLocationDetails';

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
      <ErrorDialog {...errorDialogProps} />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Study Area</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Study Area"
            aria-label="Edit Study Area"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Area Name
              </Typography>
              <Typography component="dd" variant="body1">
                {survey_details.survey_area_name}
              </Typography>
            </Grid>
          </Grid>
        </dl>
        <Box mt={4} mb={4} height={500}>
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
        <InferredLocationDetails layers={inferredLayersInfo} />
      </Box>
    </>
  );
};

export default SurveyStudyArea;
