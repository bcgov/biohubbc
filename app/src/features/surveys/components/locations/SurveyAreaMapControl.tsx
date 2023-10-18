import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import MapContainer from 'components/map/MapContainer';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { boundaryUploadHelper, calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { ISurveyLocationForm } from '../StudyAreaForm';

export interface ISurveyAreMapControlProps {
  map_id: string;
  title: string;
  formik_key: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id, formik_key, formik_props } = props;
  const { setFieldValue, setFieldError, values } = formik_props;
  const [updatedBounds, setUpdateBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('');
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  useEffect(() => {
    setUpdateBounds(calculateUpdatedMapBounds(formik_props.values.locations.map((item) => item.geojson[0])));
  }, [formik_props.values.locations]);

  return (
    <>
      <ComponentDialog open={isOpen} dialogTitle="Import Boundary" onClose={() => setIsOpen(false)}>
        <Box>
          <Box mb={3}>
            <Alert severity="info">If importing a shapefile, it must be configured with a valid projection.</Alert>
          </Box>
          <FileUpload
            uploadHandler={boundaryUploadHelper({
              onSuccess: (features: Feature[]) => {
                // Map features into form data
                const formData = features.map((item: Feature, index) => {
                  return {
                    name: `Study Area ${index + 1}`,
                    description: '',
                    geojson: [item],
                    revision_count: 0
                  };
                });
                setUpdateBounds(calculateUpdatedMapBounds(features));
                setFieldValue(formik_key, formData);
                setSelectedLayer('');
              },
              onFailure: (message: string) => {
                setFieldError(formik_key, message);
              }
            })}
            dropZoneProps={{
              acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.SPATIAL
            }}
          />
        </Box>
      </ComponentDialog>
      <Box mt={4} display="flex" alignItems="flex-start">
        <Button
          sx={{ marginBottom: 1 }}
          color="primary"
          variant="outlined"
          data-testid="boundary_file-upload"
          startIcon={<Icon path={mdiTrayArrowUp} size={1} />}
          onClick={() => {
            setIsOpen(true);
          }}>
          Import Boundary
        </Button>
        <Box ml={2}>
          <Select
            size="small"
            id="layer"
            name="layer"
            value={selectedLayer}
            onChange={(event) => setSelectedLayer(event.target.value as string)}
            displayEmpty
            inputProps={{ 'aria-label': 'Choose Map Layer' }}
            sx={{
              fontSize: '14px'
            }}>
            <MenuItem disabled value="">
              View Layer
            </MenuItem>
            <MenuItem key={1} value="pub:WHSE_WILDLIFE_MANAGEMENT.WAA_WILDLIFE_MGMT_UNITS_SVW">
              Wildlife Management Units
            </MenuItem>
            <MenuItem key={2} value="pub:WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW">
              Parks and EcoRegions
            </MenuItem>
            <MenuItem key={3} value="pub:WHSE_ADMIN_BOUNDARIES.ADM_NR_REGIONS_SPG">
              NRM Regional Boundaries
            </MenuItem>
          </Select>
        </Box>
      </Box>
      <MapContainer
        mapId={map_id}
        staticLayers={values.locations.map((item) => {
          // Features will be split at upload to each be a single item so it is safe to access the first item
          return { layerName: item.name, features: [{ geoJSON: item.geojson[0] }] };
        })}
        bounds={updatedBounds}
        selectedLayer={selectedLayer}
        setInferredLayersInfo={setInferredLayersInfo}
      />
      {!Object.values(inferredLayersInfo).every((item: any) => !item.length) && (
        <Box p={2}>
          <InferredLocationDetails layers={inferredLayersInfo} />
        </Box>
      )}
    </>
  );
};
