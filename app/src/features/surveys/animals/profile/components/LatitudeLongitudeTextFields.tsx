import { SxProps } from '@mui/material';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { ChangeEvent } from 'react';

interface ILatitudeLongitudeTextFieldsProps {
  sx: SxProps;
  latitudeValue: string;
  longitudeValue: string;
  onLatitudeChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLongitudeChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const LatitudeLongitudeTextFields = (props: ILatitudeLongitudeTextFieldsProps) => {
  return (
    <Stack direction="row" gap={1} sx={props.sx}>
      <TextField
        label="Latitude"
        name="Latitude"
        size="small"
        value={props.latitudeValue}
        type="number"
        onChange={props.onLatitudeChange}
      />
      <TextField
        label="Longitude"
        name="Longitude"
        size="small"
        value={props.longitudeValue}
        type="number"
        onChange={props.onLongitudeChange}
      />
    </Stack>
  );
};

export default LatitudeLongitudeTextFields;
