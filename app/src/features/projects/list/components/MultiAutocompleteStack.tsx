import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';

interface IMultiAutocompleteStackField {
  label: string;
  formikName: string;
}
interface IMultiAutocompleteStackProps {
  fields: IMultiAutocompleteStackField[];
}

const MultiAutocompleteStack = (props: IMultiAutocompleteStackProps) => {
  const searchBgColor = grey[50];

  return (
    <Stack
      direction="row"
      gap={0}
      sx={{
        border: `1px solid ${grey[300]}`,
        borderRadius: '5px',
        '& .MuiInputBase-root': {
          background: searchBgColor
        },
        '& fieldset': { border: 'none' },
        '& .Mui-focused': { outline: 'none', border: 'red', boxShadow: '0 !important' },
        '& .MuiInputLabel-root': { px: 1.5, background: searchBgColor }
      }}
      flex="1 1 auto">
      {props.fields.map((field, index) => (
        <Box display="flex" key={field.formikName} flex='1 1 auto'>
          {index > 0 && index !== props.fields.length && (
            <Divider orientation="vertical" flexItem sx={{ my: 1.5, bgcolor: searchBgColor }} />
          )}
          <CustomTextField name={field.formikName} label={field.label} other={{ sx: { pl: 1, flex: '1 1 auto' } }} />
        </Box>
      ))}
    </Stack>
  );
};

export default MultiAutocompleteStack;
