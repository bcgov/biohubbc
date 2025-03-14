import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IHabitatFeatureRow } from 'contexts/habitatFeatureTableContext';
import { useHabitatFeatureTableContext } from 'hooks/useContext';

const HABITAT_FEATURE_TABLE_ROW_HEIGHT = 52;
export const HABITAT_FEATURE_TABLE_PAGE_SIZES = [1, 25, 50];

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
      getRowId={(row: IHabitatFeatureRow) => row.survey_habitat_feature_id}
      rows={habitatFeatureTableContext.rows}
      columns={habitatFeatureTableContext.columns}
      loading={habitatFeatureTableContext.isLoading}
      initialState={{
        pagination: {
          paginationModel: habitatFeatureTableContext.paginationModel
        }
      }}
      // Row heights
      columnHeaderHeight={HABITAT_FEATURE_TABLE_ROW_HEIGHT}
      rowHeight={HABITAT_FEATURE_TABLE_ROW_HEIGHT}
      autoHeight={false}
      // Column visibility
      columnVisibilityModel={habitatFeatureTableContext.columnVisibilityModel}
      onColumnVisibilityModelChange={habitatFeatureTableContext.onColumnVisibilityModelChange}
      // Row selection
      rowSelectionModel={habitatFeatureTableContext.rowSelectionModel}
      onRowSelectionModelChange={habitatFeatureTableContext.onRowSelectionModelChange}
      checkboxSelection={false} // Disabled as we do not yet support multi-row bulk actions
      rowSelection={true}
      // Pagination
      paginationMode="server"
      rowCount={habitatFeatureTableContext.rowCount}
      paginationModel={habitatFeatureTableContext.paginationModel}
      onPaginationModelChange={habitatFeatureTableContext.onPaginationModelChange}
      pageSizeOptions={HABITAT_FEATURE_TABLE_PAGE_SIZES}
      // Sorting
      sortModel={habitatFeatureTableContext.sortModel}
      onSortModelChange={habitatFeatureTableContext.onSortModelChange}
      sortingOrder={['asc', 'desc']}
      // Disabled options
      disableColumnSelector
      disableColumnFilter
      disableColumnMenu
      disableVirtualization
      data-testid="survey-habitat-features-data-table"
      sx={{
        '& .MuiDataGrid-row:hover': {
          cursor: 'pointer'
        }
      }}
    />
  );
};
