import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import { mdiChevronRight, mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import FullScreenViewMapDialog from 'components/boundary/FullScreenViewMapDialog';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditLocationBoundaryI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseLocation,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useEffect, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface ILocationBoundaryProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Location boundary content for a project.
 *
 * @return {*}
 */
const LocationBoundary: React.FC<ILocationBoundaryProps> = (props) => {
  const {
    projectForViewData: { location, id },
    codes
  } = props;

  const restorationTrackerApi = useRestorationTrackerApi();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditLocationBoundaryI18N.editErrorTitle,
    dialogText: EditLocationBoundaryI18N.editErrorText,
    open: false,
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

  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [locationDataForUpdate, setLocationDataForUpdate] = useState<IGetProjectForUpdateResponseLocation>(null as any);
  const [locationFormData, setLocationFormData] = useState<IProjectLocationForm>(ProjectLocationFormInitialValues);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });
  const [bounds, setBounds] = useState<any[] | undefined>([]);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [showFullScreenViewMapDialog, setShowFullScreenViewMapDialog] = useState<boolean>(false);

  const handleDialogEditOpen = async () => {
    let locationResponseData;

    try {
      const response = await restorationTrackerApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.location]);

      if (!response?.location) {
        showErrorDialog({ open: true });
        return;
      }

      locationResponseData = response.location;
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setLocationDataForUpdate(locationResponseData);

    setLocationFormData({
      location_description: locationResponseData.location_description,
      geometry: locationResponseData.geometry
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectLocationForm) => {
    const projectData = {
      location: { ...values, revision_count: locationDataForUpdate.revision_count }
    };

    try {
      await restorationTrackerApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  useEffect(() => {
    const nonEditableGeometriesResult = location.geometry.map((geom: Feature) => {
      return { feature: geom };
    });

    setBounds(calculateUpdatedMapBounds(location.geometry));
    setNonEditableGeometries(nonEditableGeometriesResult);
  }, [location.geometry]);

  const handleDialogViewOpen = () => {
    setShowFullScreenViewMapDialog(true);
  };

  const handleClose = () => {
    setShowFullScreenViewMapDialog(false);
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditLocationBoundaryI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectLocation" codes={codes} />,
          initialValues: locationFormData,
          validationSchema: ProjectLocationFormYupSchema
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
        description={location.location_description}
        layers={<InferredLocationDetails layers={inferredLayersInfo} />}
        backButtonTitle={'Back To Project'}
        mapTitle={'Project Location'}
      />

      <Box component={Paper} px={3} pt={1} pb={3}>
        <H2ButtonToolbar
          label="Project Location"
          buttonLabel="Edit"
          buttonTitle="Edit Project Location"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          buttonProps={{ variant: 'text' }}
          toolbarProps={{ disableGutters: true }}
        />

        <Box mt={2} height={350}>
          <MapContainer
            mapId="project_location_form_map"
            hideDrawControls={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
            setInferredLayersInfo={setInferredLayersInfo}
          />
        </Box>

        <Box my={3}>
          <Typography variant="body2" color="textSecondary">
            Location Description
          </Typography>
          <Typography variant="body1">
            {location.location_description ? <>{location.location_description}</> : 'No Description'}
          </Typography>
        </Box>

        <InferredLocationDetails layers={inferredLayersInfo} />

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
    </>
  );
};

export default LocationBoundary;
