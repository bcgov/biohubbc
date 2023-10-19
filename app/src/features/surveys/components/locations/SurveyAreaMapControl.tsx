import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import { IRegionOption, RegionSelector } from 'components/map/components/RegionSelector';
import StaticLayers from 'components/map/components/StaticLayers';
import { layerContentHandlers, layerNameHandler } from 'components/map/wfs-utils';
import WFSFeatureGroup from 'components/map/WFSFeatureGroup';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
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
  const [selectedRegion, setSelectedRegion] = useState<IRegionOption | null>(null);

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
          <RegionSelector
            selectedRegion={selectedRegion}
            onRegionSelected={(data) => {
              setSelectedRegion(data);
            }}
          />
        </Box>
      </Box>
      <LeafletMapContainer
        style={{ height: '100%' }}
        id={map_id}
        center={[55, -128]}
        zoom={5}
        maxZoom={17}
        fullscreenControl={true}
        scrollWheelZoom={false}>
        {/* Programmatically set map bounds */}
        <SetMapBounds bounds={updatedBounds} />

        {selectedRegion && (
          <WFSFeatureGroup
            typeName={selectedRegion.key}
            minZoom={7}
            featureKeyHandler={layerContentHandlers[selectedRegion.key].featureKeyHandler}
            popupContentHandler={layerContentHandlers[selectedRegion.key].popupContentHandler}
            existingGeometry={[]}
            onSelectGeometry={(geo: Feature) => {
              const layerName = layerNameHandler[selectedRegion.key](geo);
              const region = {
                name: layerName,
                description: '',
                geojson: [geo],
                revision_count: 0
              };
              setFieldValue(formik_key, [...values.locations, region]);
            }}
          />
        )}

        <LayersControl position="bottomright">
          <StaticLayers
            layers={values.locations.map((item) => {
              // Features will be split at upload to each be a single item so it is safe to access the first item
              return { layerName: item.name, features: [{ geoJSON: item.geojson[0] }] };
            })}
          />
          <BaseLayerControls />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};
