import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import {
  IGetProjectForUpdateResponseLocation,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { v4 as uuidv4 } from 'uuid';
import bbox from '@turf/bbox';
import ProjectStepComponents from 'utils/ProjectStepComponents';
import {
  IProjectLocationForm,
  ProjectLocationFormInitialValues,
  ProjectLocationFormYupSchema
} from 'features/projects/components/ProjectLocationForm';
import EditDialog from 'components/dialog/EditDialog';
import { EditLocationBoundaryI18N } from 'constants/i18n';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';

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
        onClose={() => setOpenEditDialog(false)}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Location / Project Boundary</Typography>
          </Grid>
          <Grid item>
            <IconButton
              onClick={() => handleDialogEditOpen()}
              title="Edit Location / Project Boundary"
              aria-label="Edit Location / Project Boundary">
              <Typography variant="caption">
                <Edit fontSize="inherit" /> EDIT
              </Typography>
            </IconButton>
          </Grid>
        </Grid>
        <Grid container item spacing={3} xs={12}>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Region(s)</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{location.regions.join(', ')}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box color="text.disabled">
              <Typography variant="caption">Location Description</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1">{location.location_description}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box mt={5} height={500}>
              <MapContainer
                mapId="project_location_form_map"
                hideDrawControls={true}
                nonEditableGeometries={geometryCollection}
                bounds={bounds}
              />
            </Box>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default LocationBoundary;
