import { Box, Grid, IconButton, Typography } from '@material-ui/core';
import { Edit } from '@material-ui/icons';
import { IGetProjectForViewResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { v4 as uuidv4 } from 'uuid';
import bbox from '@turf/bbox';

export interface IProjectDetailsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Location boundary content for a project.
 *
 * @return {*}
 */
const LocationBoundary: React.FC<IProjectDetailsProps> = (props) => {
  const {
    projectForViewData: { location }
  } = props;

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

    if (!geometry.length) {
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

    if (geometryCollection.length) {
      const allGeosFeatureCollection = {
        type: 'FeatureCollection',
        features: geometryCollection
      };
      const bboxCoords = bbox(allGeosFeatureCollection);

      bounds.push([bboxCoords[1], bboxCoords[0]], [bboxCoords[3], bboxCoords[2]]);
    }

    return { geometryCollection, bounds };
  };

  const { geometryCollection, bounds } = generateValidGeometryCollection(location.geometry);

  return (
    <>
      <Grid container spacing={3}>
        <Grid container item xs={12} spacing={3} justify="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h3">Location / Project Boundary</Typography>
          </Grid>
          <Grid item>
            <IconButton title="Edit Location Information" aria-label="Edit Location Information">
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
