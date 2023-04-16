import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { grey } from '@material-ui/core/colors';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import { mdiChevronRight, mdiPencilOutline, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import assert from 'assert';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditSurveyStudyAreaI18N } from 'constants/i18n';
import { PROJECT_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import StudyAreaForm, {
  IStudyAreaForm,
  StudyAreaInitialValues,
  StudyAreaYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { parseSpatialDataByType } from 'utils/spatial-utils';

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
const SurveyStudyArea = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);

  // Survey data must be loaded by the parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const occurrence_submission_id =
    surveyContext.observationDataLoader.data?.surveyObservationData.occurrence_submission_id;

  const [markerLayers, setMarkerLayers] = useState<IMarkerLayer[]>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const survey_details = surveyContext.surveyDataLoader.data?.surveyData?.survey_details;
  const surveyGeometry = survey_details?.geometry || [];

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [studyAreaFormData, setStudyAreaFormData] = useState<IStudyAreaForm>(StudyAreaInitialValues);

  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  const mapDataLoader = useDataLoader((occurrenceSubmissionId: number) =>
    biohubApi.observation.getOccurrencesForView(occurrenceSubmissionId)
  );
  useDataLoaderError(mapDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Map Data',
      dialogText:
        'An error has occurred while attempting to load map data, please try again. If the error persists, please contact your system administrator.'
    };
  });

  useEffect(() => {
    if (mapDataLoader.data) {
      const result = parseSpatialDataByType(mapDataLoader.data);

      setMarkerLayers(result.markerLayers);
      setStaticLayers(result.staticLayers);
    }
  }, [mapDataLoader.data]);

  useEffect(() => {
    if (occurrence_submission_id) {
      mapDataLoader.load(occurrence_submission_id);
    }
  }, [mapDataLoader, occurrence_submission_id]);

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(calculateUpdatedMapBounds(surveyGeometry));
  }, [surveyGeometry]);

  useEffect(() => {
    const nonEditableGeometriesResult = surveyGeometry.map((geom: Feature) => {
      return { feature: geom };
    });

    if (nonEditableGeometriesResult.length) {
      setNonEditableGeometries(nonEditableGeometriesResult);
    }

    zoomToBoundaryExtent();
  }, [surveyGeometry, occurrence_submission_id, setNonEditableGeometries, zoomToBoundaryExtent]);

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

  const handleDialogEditOpen = () => {
    if (!survey_details) {
      return;
    }

    setStudyAreaFormData({
      location: {
        survey_area_name: survey_details.survey_area_name,
        geometry: survey_details.geometry
      }
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IStudyAreaForm) => {
    if (!survey_details) {
      return;
    }

    try {
      const surveyData = {
        location: {
          survey_area_name: values.location.survey_area_name,
          geometry: values.location.geometry,
          revision_count: survey_details.revision_count
        }
      };

      await biohubApi.survey.updateSurvey(surveyContext.projectId, surveyContext.surveyId, surveyData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, dialogErrorDetails: apiError.errors, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    surveyContext.surveyDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  };

  const handleOpenFullScreenMap = () => {
    setShowFullScreenViewMapDialog(true);
  };

  const handleCloseFullScreenMap = () => {
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
        onClose={handleCloseFullScreenMap}
        map={
          <MapContainer
            mapId="project_location_form_map"
            scrollWheelZoom={true}
            bounds={bounds}
            nonEditableGeometries={nonEditableGeometries}
            setInferredLayersInfo={setInferredLayersInfo}
            markerLayers={markerLayers}
            staticLayers={staticLayers}
          />
        }
        description={survey_details?.survey_area_name}
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Survey'}
        mapTitle={'Study Area'}
      />
      <ErrorDialog {...errorDialogProps} />

      <H2ButtonToolbar
        label="Study Area"
        buttonLabel="Edit Study Area"
        buttonTitle="Edit Study Area"
        buttonStartIcon={<Icon path={mdiPencilOutline} size={0.8} />}
        buttonOnClick={() => handleDialogEditOpen()}
        buttonProps={{ variant: 'text' }}
        renderButton={(buttonProps) => (
          <ProjectRoleGuard
            validProjectRoles={[PROJECT_ROLE.PROJECT_LEAD, PROJECT_ROLE.PROJECT_EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button {...buttonProps} />
          </ProjectRoleGuard>
        )}
      />

      <Box px={3} pb={3}>
        <Box height={500} position="relative">
          <MemoizedMapContainer
            mapId="survey_study_area_map"
            bounds={bounds}
            nonEditableGeometries={nonEditableGeometries}
            setInferredLayersInfo={setInferredLayersInfo}
            markerLayers={markerLayers}
            staticLayers={staticLayers}
          />
          {surveyGeometry.length > 0 && (
            <Box position="absolute" top="126px" left="10px" zIndex="999">
              <IconButton
                aria-label="zoom to initial extent"
                title="Zoom to initial extent"
                className={classes.zoomToBoundaryExtentBtn}
                onClick={() => zoomToBoundaryExtent()}
                data-testid="survey_map_center_button">
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
          <Typography variant="body1">{survey_details?.survey_area_name}</Typography>
          <Box mt={3}>
            <InferredLocationDetails layers={inferredLayersInfo} />
          </Box>
        </Box>
      </Box>

      <Box mt={3} style={{ display: 'none' }}>
        <Button
          variant="text"
          color="primary"
          className="sectionHeaderButton"
          onClick={() => handleOpenFullScreenMap()}
          title="Expand Location"
          aria-label="Show Expanded Location"
          endIcon={<Icon path={mdiChevronRight} size={0.875} />}
          data-testid="survey_map_full_screen_button">
          Show More
        </Button>
      </Box>
    </>
  );
};

/**
 * Memoized wrapper of `MapContainer` to ensure the map only re-renders if specificF props change.
 *
 * @return {*}
 */
const MemoizedMapContainer = React.memo(MapContainer, (prevProps, nextProps) => {
  return (
    prevProps.nonEditableGeometries === nextProps.nonEditableGeometries &&
    prevProps.bounds === nextProps.bounds &&
    prevProps.markerLayers === nextProps.markerLayers &&
    prevProps.staticLayers === nextProps.staticLayers
  );
});

export default SurveyStudyArea;
