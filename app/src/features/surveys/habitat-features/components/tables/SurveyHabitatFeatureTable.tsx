import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { useHabitatFeatureTableContext } from 'hooks/useContext';

const rowHeight = 52;

/**
 * Renders the Survey Habitat Feature table.
 *
 * @returns {*} {JSX.Element}
 */
export const SurveyHabitatFeatureTable = (): JSX.Element => {
  const habitatFeatureTableContext = useHabitatFeatureTableContext();

  return (
    <StyledDataGrid
      apiRef={habitatFeatureTableContext._muiDataGridApiRef}
      noRowsMessage="No habitat features found"
      columnHeaderHeight={rowHeight}
      rowHeight={rowHeight}
      rows={habitatFeatureTableContext.rows}
      getRowId={(row) => row.survey_habitat_feature_id}
      columns={habitatFeatureTableContext.columns}
      initialState={{
        pagination: {
          paginationModel: { page: 0, pageSize: 10 }
        }
      }}
      // Column visibility
      columnVisibilityModel={habitatFeatureTableContext.columnVisibilityModel}
      onColumnVisibilityModelChange={habitatFeatureTableContext.onColumnVisibilityModelChange}
      // Row selection
      rowSelectionModel={habitatFeatureTableContext.rowSelectionModel}
      onRowSelectionModelChange={habitatFeatureTableContext.onRowSelectionModelChange}
      // Pagination
      pageSizeOptions={[10, 25, 50]}
      rowSelection={true}
      autoHeight={false}
      checkboxSelection={false}
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      disableVirtualization
      sortingOrder={['asc', 'desc']}
      data-testid="survey-habitat-features-data-table"
      sx={{
        '& .MuiDataGrid-row:hover': {
          cursor: 'pointer'
        }
      }}
    />
  );
};
