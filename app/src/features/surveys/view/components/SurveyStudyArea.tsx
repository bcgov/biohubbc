import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import MapContainer from 'components/map/MapContainer';
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
import React, { useState } from 'react';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';

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

  const park: IMultiAutocompleteFieldOption[] = [
    {
      value: 'Park name 1',
      label: 'Park name 1'
    },
    {
      value: 'Park name 2',
      label: 'Park name 2'
    }
  ];

  const management_unit: IMultiAutocompleteFieldOption[] = [
    {
      value: 'Management unit 1',
      label: 'Management unit 1'
    },
    {
      value: 'Management unit 2',
      label: 'Management unit 2'
    }
  ];

  const {
    projectForViewData,
    surveyForViewData: { survey_details },
    refresh
  } = props;

  const { geometryCollection, bounds } = generateValidGeometryCollection(survey_details?.geometry);
  const nonEditableGeometries = geometryCollection.map((geom: Feature) => {
    return { feature: geom };
  });

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [surveyDetailsDataForUpdate, setSurveyDetailsDataForUpdate] = useState<IUpdateSurveyRequest>(null as any);
  const [studyAreaFormData, setStudyAreaFormData] = useState<IStudyAreaForm>(StudyAreaInitialValues);

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
      geometry: generateValidGeometryCollection(studyAreaResponseData.survey_details?.geometry).geometryCollection
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IStudyAreaForm) => {
    try {
      if (surveyDetailsDataForUpdate.survey_details) {
        const surveyData = {
          survey_details: {
            ...surveyDetailsDataForUpdate.survey_details,
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
          element: <StudyAreaForm park={park} management_unit={management_unit} />,
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
            <Grid item xs={12} sm={6} md={4}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Survey Area Name
              </Typography>
              <Typography component="dd" variant="body1">
                {survey_details.survey_area_name}
              </Typography>
            </Grid>
          </Grid>
        </dl>
        <Box mt={4} height={500}>
          <MapContainer
            mapId="survey_study_area_map"
            hideDrawControls={true}
            hideOverlayLayers={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
          />
        </Box>
      </Box>
    </>
  );
};

export default SurveyStudyArea;
