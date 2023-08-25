import { mdiChevronRight, mdiPencilOutline, mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import { makeStyles } from '@mui/styles';
import assert from 'assert';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditLocationBoundaryI18N } from 'constants/i18n';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { DialogContext } from 'contexts/dialogContext';
import { ProjectContext } from 'contexts/projectContext';
import ProjectLocationForm, {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectForUpdateResponseLocation, UPDATE_GET_ENTITIES } from 'interfaces/useProjectApi.interface';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

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
    letterSpacing: '0.02rem',
    '& + hr': {
      marginTop: theme.spacing(0.75),
      marginBottom: theme.spacing(0.75)
    }
  }
}));

/**
 * View project - Location section
 *
 * @return {*}
 */
const LocationBoundary = () => {
  const classes = useStyles();

  const biohubApi = useBiohubApi();

  const projectContext = useContext(ProjectContext);

  // Project data must be loaded by a parent before this component is rendered
  assert(projectContext.projectDataLoader.data);

  const projectData = projectContext.projectDataLoader.data.projectData;

  const dialogContext = useContext(DialogContext);

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: EditLocationBoundaryI18N.editErrorTitle,
      dialogText: EditLocationBoundaryI18N.editErrorText,
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
    });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [locationDataForUpdate, setLocationDataForUpdate] = useState<IGetProjectForUpdateResponseLocation>(null as any);
  const [locationFormData, setLocationFormData] = useState<IProjectLocationForm>(ProjectLocationFormInitialValues);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });
  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);

  const handleDialogEditOpen = async () => {
    let locationResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(projectContext.projectId, [
        UPDATE_GET_ENTITIES.location
      ]);

      if (!response?.location) {
        showErrorDialog();
        return;
      }

      locationResponseData = response.location;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message });
      return;
    }

    setLocationDataForUpdate(locationResponseData);

    setLocationFormData({
      location: {
        location_description: locationResponseData.location_description,
        geometry: locationResponseData.geometry
      }
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectLocationForm) => {
    const projectLocationData = {
      ...values.location,
      revision_count: locationDataForUpdate.revision_count
    };

    const projectData = { location: projectLocationData };

    try {
      await biohubApi.project.updateProject(projectContext.projectId, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    projectContext.projectDataLoader.refresh(projectContext.projectId);
  };

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(calculateUpdatedMapBounds(projectData.location.geometry));
  }, [projectData.location.geometry]);

  useEffect(() => {
    const nonEditableGeometriesResult = projectData.location.geometry.map((geom: Feature) => {
      return { feature: geom };
    });

    zoomToBoundaryExtent();
    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [projectData.location.geometry, zoomToBoundaryExtent]);

  const handleOpenFullScreenMap = () => {
    setShowFullScreenViewMapDialog(true);
  };

  const handleCloseFullScreenMap = () => {
    setShowFullScreenViewMapDialog(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditLocationBoundaryI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectLocationForm />,
          initialValues: locationFormData,
          validationSchema: ProjectLocationFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <FullScreenViewMapDialog
        open={showFullScreenViewMapDialog}
        onClose={handleCloseFullScreenMap}
        map={
          <MemoizedMapContainer
            mapId="project_location_form_map"
            scrollWheelZoom={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
          />
        }
        description={projectData.location.location_description}
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Project'}
        mapTitle={'Project Location'}
      />

      <H2ButtonToolbar
        label="Project Location"
        buttonLabel="Edit"
        buttonTitle="Edit Project Location"
        buttonStartIcon={<Icon path={mdiPencilOutline} size={1} />}
        buttonOnClick={() => handleDialogEditOpen()}
        // TODO: (https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-161) Commenting out location form (edit button) temporarily, while its decided where exactly project/survey locations should be defined
        buttonProps={{ variant: 'text', disabled: true, sx: { display: 'none' } }}
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
            mapId="project_location_form_map"
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
          />
          {(projectData.location.geometry.length && (
            <Box position="absolute" top="126px" left="10px" zIndex="999">
              <IconButton
                aria-label="zoom to initial extent"
                title="Zoom to initial extent"
                className={classes.zoomToBoundaryExtentBtn}
                onClick={() => zoomToBoundaryExtent()}>
                <Icon size={1} path={mdiRefresh} />
              </IconButton>
            </Box>
          )) || <></>}
        </Box>

        {/* TODO: (https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-161) Commenting out location form (description) temporarily, while its decided where exactly project/survey locations should be defined */}
        {/* <Box mt={3}>
          <Typography variant="body2" className={classes.metaSectionHeader}>
            Location Description
          </Typography>
          <Divider></Divider>
          <Typography variant="body1">
            {projectData.location.location_description ? (
              <>{projectData.location.location_description}</>
            ) : (
              'No description provided'
            )}
          </Typography>
          <Box mt={3}>
            <InferredLocationDetails layers={inferredLayersInfo} />
          </Box>
        </Box> */}

        <Button
          variant="text"
          style={{ display: 'none' }}
          color="primary"
          className="sectionHeaderButton"
          onClick={() => handleOpenFullScreenMap()}
          title="Expand Location"
          aria-label="Show Expanded Location"
          endIcon={<Icon path={mdiChevronRight} size={0.875} />}>
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
  return prevProps.nonEditableGeometries === nextProps.nonEditableGeometries && prevProps.bounds === nextProps.bounds;
});

export default LocationBoundary;
