import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Paper from '@material-ui/core/Paper';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import { mdiChevronRight, mdiPencilOutline, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditSurveyStudyAreaI18N } from 'constants/i18n';
import StudyAreaForm, {
  IStudyAreaForm,
  StudyAreaInitialValues,
  StudyAreaYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import { IGetSurveyForViewResponse } from 'interfaces/useSurveyApi.interface';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useCallback, useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ISurveyStudyAreaProps {
  surveyForViewData: IGetSurveyForViewResponse;
  projectForViewData: IGetProjectForViewResponse;
  mapLayersForView: { markerLayers: IMarkerLayer[]; staticLayers: IStaticLayer[] };
  refresh: () => void;
}

const useStyles = makeStyles((theme: Theme) =>
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
    },
    metaSectionHeader: {
      color: grey[600],
      fontWeight: 700,
      textTransform: 'uppercase',
      '& + hr': {
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75)
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
  const [studyAreaFormData, setStudyAreaFormData] = useState<IStudyAreaForm>(StudyAreaInitialValues);

  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(calculateUpdatedMapBounds(surveyGeometry));
  }, [surveyGeometry]);

  useEffect(() => {
    zoomToBoundaryExtent();
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
            scrollWheelZoom={true}
            bounds={bounds}
            markerLayers={props.mapLayersForView.markerLayers}
            staticLayers={props.mapLayersForView.staticLayers}
          />
        }
        description={survey_details.survey_area_name}
        layers={() => {}}
        backButtonTitle={'Back To Survey'}
        mapTitle={'Study Area'}
      />
      <ErrorDialog {...errorDialogProps} />
      <Paper>
        <H2ButtonToolbar
          label="Study Area"
          buttonLabel="Edit Study Area"
          buttonTitle="Edit Study Area"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.8} />}
          buttonOnClick={() => handleDialogEditOpen()}
          buttonProps={{ variant: 'text' }}
        />

        <Box px={3} pb={3}>
          <Box height={500} position="relative">
            <MapContainer
              mapId="survey_study_area_map"
              bounds={bounds}
              markerLayers={props.mapLayersForView.markerLayers}
              staticLayers={props.mapLayersForView.staticLayers}
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
          <Box mt={3}>
            <Typography variant="body2" component="h3" className={classes.metaSectionHeader}>
              Study Area Name
            </Typography>
            <Divider></Divider>
            <Typography variant="body1">{survey_details.survey_area_name}</Typography>
          </Box>
        </Box>

        <Box mt={3} style={{ display: 'none' }}>
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
      </Paper>
    </>
  );
};

export default SurveyStudyArea;
