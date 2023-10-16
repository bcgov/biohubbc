import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { IUploadHandler } from 'components/file-upload/FileUploadItem';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature, GeoJsonProperties, Geometry } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useState } from 'react';
import { handleGPXUpload1, handleKMLUpload1, handleShapeFileUpload1 } from 'utils/mapBoundaryUploadHelpers';
import { ISurveyLocationForm } from '../StudyAreaForm';

export interface ISurveyAreMapControlProps {
  map_id: string;
  title: string;
  formik_key: string;
  formik_props: FormikContextType<ISurveyLocationForm>;
}

export const SurveyAreaMapControl = (props: ISurveyAreMapControlProps) => {
  const { map_id, formik_key, formik_props } = props;
  const { setFieldValue, setFieldError } = formik_props;
  const [updatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const boundaryUploadHandler = (): IUploadHandler => {
    return async (file) => {
      let features: Feature<Geometry, GeoJsonProperties>[] = [];
      try {
        if (file?.type.includes('zip') || file?.name.includes('.zip')) {
          features = await handleShapeFileUpload1(file);
        } else if (file?.type.includes('gpx') || file?.name.includes('.gpx')) {
          features = await handleGPXUpload1(file);
        } else if (file?.type.includes('kml') || file?.name.includes('.kml')) {
          features = await handleKMLUpload1(file);
        }

        const mapStaticLayers = features.map((item: Feature, index) => {
          return { layerName: `Study Area ${index + 1}`, features: [{ geoJSON: item }] };
        });
        console.log(formik_key);
        const formData = features.map((item: Feature, index) => {
          return {
            name: `Study Area ${index + 1}`,
            description: '',
            geojson: [item],
            revision_count: 0
          };
        });
        setStaticLayers(mapStaticLayers);
        setFieldValue(formik_key, formData);
      } catch (error) {
        setFieldError(formik_key, String(error));
      }
    };
  };

  return (
    <>
      <ComponentDialog open={isOpen} dialogTitle="Import Boundary" onClose={() => setIsOpen(false)}>
        <Box>
          <Box mb={3}>
            <Alert severity="info">If importing a shapefile, it must be configured with a valid projection.</Alert>
          </Box>
          <FileUpload
            uploadHandler={boundaryUploadHandler()}
            dropZoneProps={{
              acceptedFileExtensions: ProjectSurveyAttachmentValidExtensions.SPATIAL
            }}
          />
        </Box>
      </ComponentDialog>
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
      <MapContainer
        mapId={map_id}
        staticLayers={staticLayers}
        // staticLayers={[
        //   {
        //     layerName: 'Sample Layer',
        //     features: []
        //   }
        // ]}
        bounds={updatedBounds}
      />
    </>
  );
};
