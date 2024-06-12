import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useFormikContext } from 'formik';
import { PropsWithChildren, useEffect } from 'react';

interface ISearchFiltersProps {
  fields: JSX.Element[];
}

const SearchFilters = <FormikValues extends Record<string, string>>(props: PropsWithChildren<ISearchFiltersProps>) => {
  const { fields } = props;

  const { values, submitForm } = useFormikContext<FormikValues>();

  useEffect(() => {
    submitForm();
  }, [submitForm, values]);

  return (
    <Stack spacing={1}>
      <Box display="flex" alignItems="center">
        <Stack
          direction="row"
          gap={0}
          sx={{
            flexGrow: 1,
            border: `1px solid ${grey[300]}`,
            borderRadius: '5px',
            '& .MuiInputBase-root': {
              background: grey[50]
            },
            '& fieldset': { border: 'none' },
            '& .Mui-focused': { outline: 'none', border: 'red', boxShadow: '0 !important' },
            '& .MuiInputLabel-root': { mx: 0, background: grey[50] }
          }}
          flex="1 1 auto">
          {fields.map((field, index) => {
            const children = [
              <Box key={`search-filters-${index}`} width={`${100 / fields.length}%`}>
                {field}
              </Box>
            ];

            if (index < fields.length - 1) {
              children.push(<Divider orientation="vertical" flexItem sx={{ my: 1 }} />);
            }

            return children;
          })}
        </Stack>
      </Box>
    </Stack>
  );
};

export default SearchFilters;
