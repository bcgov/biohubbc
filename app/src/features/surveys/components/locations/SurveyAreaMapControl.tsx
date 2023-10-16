import { mdiTrayArrowUp } from '@mdi/js';
import Icon from '@mdi/react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import MapContainer from 'components/map/MapContainer';
import { ProjectSurveyAttachmentValidExtensions } from 'constants/attachments';
import { FormikContextType } from 'formik';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useState } from 'react';
import { boundaryUploadHelper } from 'utils/mapBoundaryUploadHelpers';
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
  const [updatedBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [isOpen, setIsOpen] = useState(false);

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
        staticLayers={values.locations.map((item) => {
          // Features will be split at upload to each be a single item so it is safe to access the first item
          return { layerName: item.name, features: [{ geoJSON: item.geojson[0] }] };
        })}
        bounds={updatedBounds}
      />
    </>
  );
};
