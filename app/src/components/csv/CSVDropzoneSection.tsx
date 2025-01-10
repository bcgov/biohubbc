import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { CSVErrorsTableContainer } from 'components/csv/CSVErrorsTableContainer';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { PropsWithChildren } from 'react';
import { CSVError } from 'utils/csv-utils';

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
    <HorizontalSplitFormComponent title={props.title} summary={props.summary}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }} gap={2}>
        <Box sx={{ display: 'flex', ml: 'auto' }}>
          <Button
            sx={{ textTransform: 'none', fontWeight: 'regular' }}
            variant="outlined"
            size="small"
            onClick={props.onDownloadTemplate}>
            Download Template
          </Button>
        </Box>
        {props.children}
        {props.errors.length > 0 ? <CSVErrorsTableContainer errors={props.errors} /> : null}
      </Box>
    </HorizontalSplitFormComponent>
  );
};
