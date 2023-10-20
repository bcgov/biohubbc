import { mdiChevronRight, mdiPencilOutline, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
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
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { SurveyContext } from 'contexts/surveyContext';
import StudyAreaForm, {
  ISurveyLocationForm,
  SurveyLocationInitialValues,
  SurveyLocationYupSchema
} from 'features/surveys/components/StudyAreaForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { parseSpatialDataByType } from 'utils/spatial-utils';

const useStyles = makeStyles((theme: Theme) => ({
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
}));

/**
 * View survey - Study area section
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

  const surveyLocations = surveyContext.surveyDataLoader.data?.surveyData?.locations;
  const surveyLocation = surveyLocations[0] || null;
  const surveyGeometry = useMemo(() => surveyLocation?.geojson || [], [surveyLocation]);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [studyAreaFormData, setStudyAreaFormData] = useState<ISurveyLocationForm>(SurveyLocationInitialValues);

  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  const mapDataLoader = useDataLoader((projectId: number, occurrenceSubmissionId: number) =>
    biohubApi.observation.getOccurrencesForView(projectId, occurrenceSubmissionId)
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
      mapDataLoader.load(surveyContext.projectId, occurrence_submission_id);
    }
  }, [mapDataLoader, occurrence_submission_id, surveyContext.projectId]);

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

  // TODO: This component should not define error dialog props in state and should instead consume the dialog context.
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
    if (!surveyLocation) {
      return;
    }

    setStudyAreaFormData({
      locations: [
        {
          survey_location_id: surveyLocation.survey_location_id,
          name: surveyLocation.name,
          description: surveyLocation.description,
          geojson: surveyLocation.geojson,
          revision_count: surveyLocation.revision_count,
          isDrawn: false
        }
      ]
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: ISurveyLocationForm) => {
    if (!surveyLocation) {
      return;
    }

    try {
      const surveyData = {
        locations: values.locations.map((item) => {
          return {
            survey_location_id: item.survey_location_id,
            name: item.name,
            description: item.description,
            geojson: item.geojson,
            revision_count: surveyLocation.revision_count,
            isDrawn: item.isDrawn
          };
        })
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
          validationSchema: SurveyLocationYupSchema
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
        description={surveyLocation?.name}
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Survey'}
        mapTitle={'Study Area'}
      />

      <ErrorDialog {...errorDialogProps} />

      <H2ButtonToolbar
        label="Study Area"
        buttonLabel="Edit"
        buttonTitle="Edit Study Area"
        buttonStartIcon={<Icon path={mdiPencilOutline} size={1} />}
        buttonOnClick={() => handleDialogEditOpen()}
        buttonProps={{ variant: 'text' }}
        renderButton={(buttonProps) => (
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
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
          <Typography variant="body1">{surveyLocation?.name}</Typography>
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
