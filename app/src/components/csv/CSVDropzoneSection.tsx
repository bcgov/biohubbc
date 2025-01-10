import { Box, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import { PropsWithChildren } from 'react';
import { CSVError } from 'utils/csv-utils';
import { CSVErrorsCardStackContainer } from './CSVErrorsCardStackContainer';

interface CSVDropzoneSectionProps {
  title: string;
  summary: string;
  onDownloadTemplate: () => void;
  errors: CSVError[];
}

/**
 * A section that contains a dropzone for CSV files.
 * Also renders a table to display errors that occured during the CSV file validation.
 *
 * @param {CSVDropzoneSectionProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVDropzoneSection = (props: PropsWithChildren<CSVDropzoneSectionProps>) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={2}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h3">{props.title}</Typography>
        <Button
          sx={{ textTransform: 'none', fontWeight: 'regular' }}
          variant="outlined"
          size="small"
          onClick={props.onDownloadTemplate}>
          Download Template
        </Button>
      </Box>
      <Typography color="textSecondary" variant="body2">
        {props.summary}
      </Typography>
      {props.children}
      {props.errors.length > 0 ? <CSVErrorsCardStackContainer errors={props.errors} /> : null}
    </Box>
  );
};
