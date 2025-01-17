import { Toolbar, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import { ReactElement } from 'react';
import { CSVError } from 'utils/csv-utils';
import { CSVErrorsCardStack } from './CSVErrorsCardStack';

interface CSVErrorsCardStackContainerProps {
  errors: CSVError[];
  title?: ReactElement;
}

/**
 * Renders a CSV errors table with toolbar.
 *
 * @param {CSVErrorsCardStackContainerProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVErrorsCardStackContainer = (props: CSVErrorsCardStackContainerProps) => {
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
        <CSVErrorsCardStack errors={props.errors} />
      </Box>
    </Stack>
  );
};
