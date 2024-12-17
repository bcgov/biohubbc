import { Box } from '@mui/material';
import Button from '@mui/material/Button';
import { CSVErrorsTable } from 'components/csv/CSVErrorsTable';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { PropsWithChildren, useState } from 'react';
import { CSVError } from 'utils/file-utils';

interface CSVDropzoneSectionProps {
  title: string;
  summary: string;
  onDownloadTemplate: () => void;
  errors: CSVError[];
}

export const CSVDropzoneSection = (props: PropsWithChildren<CSVDropzoneSectionProps>) => {
  const [showErrorsTable, setShowErrorsTable] = useState(false);

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
          {props.errors.length > 0 && (
            <Button
              sx={{ ml: 2, textTransform: 'none', fontWeight: 'regular' }}
              variant="contained"
              color="error"
              size="small"
              onClick={() => setShowErrorsTable((s) => !s)}>
              View CSV Errors
            </Button>
          )}
        </Box>
        {props.children}
        {showErrorsTable && <CSVErrorsTable errors={props.errors} />}
      </Box>
    </HorizontalSplitFormComponent>
  );
};
