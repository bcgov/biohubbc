import { mdiTable } from "@mdi/js";
import Icon from "@mdi/react";
import Button from "@mui/material/Button";
import { useObservationsTableContext } from "hooks/useContext";
import { useMemo } from "react";
import { makeCsvObjectUrl } from "utils/Utils";

type IExportHeadersButton = {
  //
}

const ExportHeadersButton = (props: IExportHeadersButton) => {
  const observationsTableContext = useObservationsTableContext();

  const headerCsvDownloadHref = useMemo(() => {
    const tableColumns = observationsTableContext._muiDataGridApiRef.current?.getAllColumns?.() ?? [];
    const headerNames = tableColumns.map((column) => column.headerName);
    const csvObject: Record<string, ''>[] = [Object.fromEntries(headerNames.map((headerName) => [headerName, '']))];

    return makeCsvObjectUrl(csvObject);

  // TODO double-check this useMemo dep
  }, [observationsTableContext._muiDataGridApiRef.current?.getAllColumns]);

  return (
    <Button
      startIcon={<Icon path={mdiTable} />}
      href={headerCsvDownloadHref}
    >Export Headers</Button>
  )
}

export default ExportHeadersButton
