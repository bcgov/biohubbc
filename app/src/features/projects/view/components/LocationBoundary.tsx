import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import { EditLocationBoundaryI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseLocation,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';
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

  const biohubApi = useBiohubApi();

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

  const handleDialogEditOpen = async () => {
    let locationResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.location]);

      if (!response?.location) {
        showErrorDialog({ open: true });
        return;
      }

      locationResponseData = response.location;
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setLocationDataForUpdate(locationResponseData);

    setLocationFormData({
      location_description: locationResponseData.location_description,
      geometry: generateValidGeometryCollection(locationResponseData.geometry).geometryCollection
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectLocationForm) => {
    const projectData = {
      location: { ...values, revision_count: locationDataForUpdate.revision_count }
    };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  const { geometryCollection, bounds } = generateValidGeometryCollection(location.geometry);
  const nonEditableGeometries = geometryCollection.map((geom: Feature) => {
    return { feature: geom };
  });

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
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h3">Location / Project Boundary</Typography>
          <Button
            variant="text"
            color="primary"
            className="sectionHeaderButton"
            onClick={() => handleDialogEditOpen()}
            title="Edit Location / Project Boundary"
            aria-label="Edit Location / Project Boundary"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            Edit
          </Button>
        </Box>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Location Description
              </Typography>
              <Typography component="dd" variant="body1">
                {location.location_description ? <>{location.location_description}</> : 'No Description'}
              </Typography>
            </Grid>
          </Grid>
        </dl>
        <Box mt={4} height={500}>
          <MapContainer
            mapId="project_location_form_map"
            hideDrawControls={true}
            nonEditableGeometries={nonEditableGeometries}
            bounds={bounds}
          />
        </Box>
      </Box>
    </>
  );
};

export default LocationBoundary;
