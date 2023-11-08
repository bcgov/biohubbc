import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import ComponentDialog from 'components/dialog/ComponentDialog';
import FileUpload from 'components/file-upload/FileUpload';
import { Feature } from 'geojson';
import { boundaryUploadHelper } from 'utils/mapBoundaryUploadHelpers';

export interface IImportBoundaryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (features: Feature[]) => void;
  onFailure: (message: string) => void;
}

const ImportBoundaryDialog = (props: IImportBoundaryDialogProps) => {
  const { isOpen, onClose, onSuccess, onFailure } = props;
  return (
    <ComponentDialog open={isOpen} dialogTitle="Import Boundary" onClose={onClose}>
      <Box>
        <Box mb={3}>
          <Alert severity="info">Shapefiles must be compressed into a single zip file. They can include one or more study area features.</Alert>
        </Box>
        <FileUpload
          uploadHandler={boundaryUploadHelper({
            onSuccess,
            onFailure
          })}
          dropZoneProps={{
            maxNumFiles: 1,
            multiple: false,
            acceptedFileExtensions: '.kml, .zip'
          }}
        />
      </Box>
    </ComponentDialog>
  );
};

export default ImportBoundaryDialog;
