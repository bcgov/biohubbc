import { Toolbar, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { ReactElement } from 'react';
import { CSVError } from 'utils/csv-utils';
import { CSVErrors } from './CSVErrors';

interface CSVErrorsContainerProps {
  errors: CSVError[];
  title?: ReactElement;
}

/**
 * Renders a CSV errors table with toolbar.
 *
 * @param {CSVErrorsContainerProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVErrorsContainer = (props: CSVErrorsContainerProps) => {
  return (
    <Stack flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar disableGutters>
        {props.title ?? (
          <Typography
            sx={{
              flexGrow: '1',
              fontWeight: 700
            }}>
            Errors &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({props.errors.length})
            </Typography>
          </Typography>
        )}
      </Toolbar>
      <Box width="100%" height="100%">
        <CSVErrors errors={props.errors} />
      </Box>
    </Stack>
  );
};
