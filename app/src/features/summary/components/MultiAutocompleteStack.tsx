import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import React, { PropsWithChildren } from 'react';

export const MultiAutocompleteStack = (props: PropsWithChildren) => {
  const searchBgColor = grey[50];

  return (
    <Stack
      direction="row"
      gap={0}
      sx={{
        flexGrow: 1,
        border: `1px solid ${grey[300]}`,
        borderRadius: '5px',
        '& .MuiInputBase-root': {
          background: searchBgColor
        },
        '& fieldset': { border: 'none' },
        '& .Mui-focused': { outline: 'none', border: 'red', boxShadow: '0 !important' },
        '& .MuiInputLabel-root': { mx: 0, background: searchBgColor }
      }}
      flex="1 1 auto">
      {React.Children.map(props.children, (child, index) => (
        <>
          {child}
          {index < React.Children.count(props.children) - 1 && (
            <Divider orientation="vertical" flexItem sx={{ my: 1 }} />
          )}
        </>
      ))}
    </Stack>
  );
};
