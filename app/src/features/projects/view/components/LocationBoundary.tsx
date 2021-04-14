import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import bbox from '@turf/bbox';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import MapContainer from 'components/map/MapContainer';
import { EditLocationBoundaryI18N } from 'constants/i18n';
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
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import { v4 as uuidv4 } from 'uuid';

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

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditLocationBoundaryI18N.editErrorTitle,
    dialogText: EditLocationBoundaryI18N.editErrorText,
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
      regions: locationResponseData.regions,
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

  /*
    Leaflet does not know how to draw Multipolygons or GeometryCollections
    that are not in proper GeoJSON format so we manually convert to a Feature[]
    of GeoJSON objects which it can draw using the <GeoJSON /> tag for
    non-editable geometries

    We also set the bounds based on those geometries so the extent is set
  */
  const generateValidGeometryCollection = (geometry: any) => {
    let geometryCollection: Feature[] = [];
    let bounds: any[] = [];

    if (!geometry || !geometry.length) {
      return { geometryCollection, bounds };
    }

    if (geometry[0]?.type === 'MultiPolygon') {
      geometry[0].coordinates.forEach((geoCoords: any) => {
        geometryCollection.push({
          id: uuidv4(),
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: geoCoords
          },
          properties: {}
        });
      });
    } else if (geometry[0]?.type === 'GeometryCollection') {
      geometry[0].geometries.forEach((geometry: any) => {
        geometryCollection.push({
          id: uuidv4(),
          type: 'Feature',
          geometry,
          properties: {}
        });
      });
    } else if (geometry[0]?.type !== 'Feature') {
      geometryCollection.push({
        id: uuidv4(),
        type: 'Feature',
        geometry: geometry[0],
        properties: {}
      });
    } else {
      geometryCollection.push(geometry[0]);
    }

    const allGeosFeatureCollection = {
      type: 'FeatureCollection',
      features: geometryCollection
    };
    const bboxCoords = bbox(allGeosFeatureCollection);

    bounds.push([bboxCoords[1], bboxCoords[0]], [bboxCoords[3], bboxCoords[2]]);

    return { geometryCollection, bounds };
  };

  const { geometryCollection, bounds } = generateValidGeometryCollection(location.geometry);

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
      <ErrorDialog {...errorDialogProps} />
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h3">Location / Project Boundary</Typography>
          <Button
            className="editButtonSmall"
            onClick={() => handleDialogEditOpen()}
            title="Edit Location / Project Boundary"
            aria-label="Edit Location / Project Boundary"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            EDIT
          </Button>
        </Box>
        <dl>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography component="dt" variant="subtitle2" color="textSecondary">
                Region(s)
              </Typography>
              <Typography component="dd" variant="body1">
                {location.regions.join(', ')}
              </Typography>
            </Grid>
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
            nonEditableGeometries={geometryCollection}
            bounds={bounds}
          />
        </Box>
      </Box>
    </>
  );
};

export default LocationBoundary;
