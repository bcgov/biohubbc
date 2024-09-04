import { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IObservationAnalyticsRow } from 'features/surveys/view/components/analytics/components/ObservationAnalyticsDataTableContainer';

const rowHeight = 50;

interface IObservationAnalyticsDataTableProps {
  isLoading: boolean;
  columns: GridColDef<IObservationAnalyticsRow>[];
  rows: IObservationAnalyticsRow[];
  columnVisibilityModel: GridColumnVisibilityModel;
}

/**
 * Observation Analytics Data Table.
 *
 * @param {IObservationAnalyticsDataTableProps} props
 * @return {*}
 */
export const ObservationAnalyticsDataTable = (props: IObservationAnalyticsDataTableProps) => {
  const { isLoading, columns, rows, columnVisibilityModel } = props;

  return (
    <StyledDataGrid
      // Loading
      loading={isLoading}
      noRowsMessage="No observation records found"
      // Column
      columnHeaderHeight={rowHeight}
      columns={columns}
      // Column visibility
      columnVisibilityModel={columnVisibilityModel}
      // Row
      rows={rows}
      rowHeight={rowHeight}
      rowCount={rows.length}
      autoHeight={false}
      // Sorting
      sortingMode="server"
      // Row selection
      rowSelection
      checkboxSelection
      // Pagination
      initialState={{
        pagination: {
          paginationModel: { page: 1, pageSize: 10 }
        }
      }}
      pageSizeOptions={[10, 25, 50]}
      // Other
      disableRowSelectionOnClick
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      disableVirtualization
      // Styling
      sx={{
        '& .MuiDataGrid-columnHeaderDraggableContainer': { minWidth: '50px' },
        '& .MuiDataGrid-cellContent, .MuiTypography-root': {
          textTransform: 'capitalize',
          fontSize: '0.9rem'
        }
      }}
      // Testing
      data-testid="survey-spatial-observation-data-table"
    />
  );
};
