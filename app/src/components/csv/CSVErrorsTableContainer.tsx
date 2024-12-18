import { Divider, Paper, Toolbar, Typography } from '@mui/material';
import { Stack } from '@mui/system';
import { ReactElement } from 'react';
import { CSVError } from 'utils/file-utils';
import { CSVErrorsTable } from './CSVErrorsTable';

interface CSVErrorsTableContainerProps {
  errors: CSVError[];
  title?: ReactElement;
}

/**
 * Renders a CSV errors table with toolbar.
 *
 * @param {CSVErrorsTableContainerProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVErrorsTableContainer = (props: CSVErrorsTableContainerProps) => {
  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        {props.title ?? (
          <Typography
            sx={{
              flexGrow: '1',
              fontSize: '1.125rem',
              fontWeight: 700
            }}>
            CSV Errors Detected &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({props.errors.length})
            </Typography>
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <CSVErrorsTable errors={props.errors} />
    </Paper>
  );
};
