import Box from '@material-ui/core/Box';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import MapContainer, { IClusteredPointGeometries } from 'components/map/MapContainer';
import { useFormikContext } from 'formik';
import { Feature } from 'geojson';
import React, { useEffect } from 'react';
import { updateMapBounds } from 'utils/mapBoundaryUploadHelpers';

export interface ISearchAdvancedFilters {
  record_type: string;
  geometry: Feature[];
}

export const SearchAdvancedFiltersInitialValues: ISearchAdvancedFilters = {
  record_type: 'project',
  geometry: []
};

export interface ISearchAdvancedFiltersProps {
  geometryResult: IClusteredPointGeometries[];
  boundsResult: any[];
  setBoundsResult: (boundsResult: any[]) => void;
}

/**
 * Spatial Search - Advanced filters
 *
 * @return {*}
 */
const SearchAdvancedFilters: React.FC<ISearchAdvancedFiltersProps> = (props) => {
  const formikProps = useFormikContext<ISearchAdvancedFilters>();

  const { handleSubmit, values, setFieldValue, handleChange } = formikProps;

  useEffect(() => {
    updateMapBounds(values.geometry, props.setBoundsResult);
  }, [values.geometry]);

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl variant="outlined" required={false} style={{ width: '100%' }}>
            <InputLabel id="record_type">Record Type</InputLabel>
            <Select
              id="record_type"
              name="record_type"
              labelId="record_type"
              label="Record Type"
              value={values.record_type}
              onChange={handleChange}
              displayEmpty
              inputProps={{ 'aria-label': 'Record Type' }}>
              <MenuItem key={1} value="project">
                Projects
              </MenuItem>
              <MenuItem key={2} value="survey">
                Surveys
              </MenuItem>
              <MenuItem key={3} value="occurrence">
                Survey Occurrences
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Box mt={2} height={600}>
            <MapContainer
              mapId="search_boundary_map"
              //@ts-ignore
              geometryState={{
                geometry: values.geometry,
                setGeometry: (newGeo: Feature[]) => {
                  setFieldValue('geometry', [newGeo[newGeo.length - 1]]);
                }
              }}
              clusteredPointGeometries={props.geometryResult}
              bounds={props.boundsResult}
            />
          </Box>
        </Grid>
      </Grid>
    </form>
  );
};

export default SearchAdvancedFilters;
