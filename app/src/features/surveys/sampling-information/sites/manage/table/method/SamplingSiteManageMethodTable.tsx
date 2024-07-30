import { GridColDef, GridRowSelectionModel } from '@mui/x-data-grid';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { SamplingSiteManageTable } from '../SamplingSiteManageTable';

interface ISamplingSiteMethodRowData {
  id: number;
  name: string;
}

interface ISamplingSiteManageMethodTableProps {
  sites: IGetSampleSiteResponse;
  handleRowSelection: (selection: GridRowSelectionModel) => void;
  rowSelectionModel: GridRowSelectionModel;
}

export const SamplingSiteManageMethodTable = (props: ISamplingSiteManageMethodTableProps) => {
  const { sites, rowSelectionModel, handleRowSelection } = props;

  const methods = sites?.sampleSites.flatMap((site) => site.sample_methods) || [];

  const rows: ISamplingSiteMethodRowData[] = methods.map((method) => ({
    id: method.survey_sample_method_id,
    name: method.technique.name
  }));

  const columns: GridColDef<ISamplingSiteMethodRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3
    }
  ];

  return (
    <SamplingSiteManageTable
      rows={rows}
      columns={columns}
      rowSelectionModel={rowSelectionModel}
      handleRowSelection={handleRowSelection}
      noRowsMessage="No methods"
      noRowsOverlayTitle="Add Sampling methods"
      noRowsOverlaySubtitle="Sampling methods show where techniques were implemented"
      checkboxSelection
      sx={{
        '& .MuiDataGrid-columnHeaderDraggableContainer': {
          minWidth: '50px'
        }
      }}
    />
  );
};
