import { mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import dayjs from 'dayjs';
import { useObservationsTableContext } from 'hooks/useContext';
import { makeCsvObjectUrl } from 'utils/Utils';

// Fields which will not be included in the downloaded CSV template
const excludedFields = ['__check__', 'actions'];

const ExportHeadersButton = () => {
  const observationsTableContext = useObservationsTableContext();

  const handleDownload = () => {
    const tableColumns = observationsTableContext._muiDataGridApiRef.current?.getAllColumns?.() ?? [];

    const headerNames = tableColumns
      .filter((column) => !excludedFields.includes(column.field))
      .map((column) => column.headerName)
      // Remove action columns that do not have a label, replaced below
      .filter(Boolean);

    // Inject action columns that do not have a label (eg. comment)
    headerNames.push('comment');

    const csvObject: Record<string, ''>[] = [Object.fromEntries(headerNames.map((headerName) => [headerName, '']))];

    const url = makeCsvObjectUrl(csvObject);
    const timestamp = dayjs().format('YYYY_MM_DD_HH_mm_ss');
    const fileName = `SIMS_Observations_Template_${timestamp}.csv`;

    const anchorElement = document.createElement('a');
    anchorElement.href = url;
    anchorElement.download = fileName;
    anchorElement.click();
  };

  return (
    <Button
      title="Download Observation CSV"
      variant="outlined"
      onClick={handleDownload}
      startIcon={<Icon path={mdiTrayArrowDown} size={1} />}
      aria-label="Download Observation CSV">
      Template
    </Button>
  );
};

export default ExportHeadersButton;
