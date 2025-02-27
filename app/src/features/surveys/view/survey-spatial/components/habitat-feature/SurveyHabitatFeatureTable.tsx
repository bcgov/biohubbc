import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import { GridColDef } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';

// TODO: Mac: Should this be `SurveySpatialHabitatFeatureTable` or `SurveyHabitatFeatureTable`?
// The latter makes sense if this is a shared component between survey page and the Manage Habitat Features page

const rowHeight = 52;

interface IHabitatFeatureRow {
  survey_habitat_feature_id: number;
  survey_id: number;
  habitat_feature_id: number;
  count: number;
  latitude: number | null;
  longitude: number | null;
  observed_date: string;
  observed_time: string;
}

interface ISurveyHabitatFeatureTableProps {
  isLoading: boolean;
}

/**
 * Returns table of `Habitat Features` in the Survey
 *
 * @param {ISurveyHabitatFeatureTableProps} props
 * @returns {*}
 */
export const SurveyHabitatFeatureTable = (props: ISurveyHabitatFeatureTableProps) => {
  // TODO: Mac: Implement the logic for fetching the habitat features

  const rows: IHabitatFeatureRow[] = [];
  const columns: GridColDef<IHabitatFeatureRow>[] = [
    {
      field: 'habitat_feature_id',
      headerName: 'Habitat Feature',
      align: 'left',
      maxWidth: 200,
      valueGetter: (params) => {
        return params.row.habitat_feature_id; // TODO: Mac: Replace this with the actual habitat feature name
      }
    },
    {
      field: 'count',
      headerName: 'Count',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'latitude',
      headerName: 'Latitude', // TODO: Mac: Should this lat
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'longitude',
      headerName: 'Longitude', // TODO: Mac: Should this be long
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    },
    {
      field: 'observed_date',
      headerName: 'Date',
      maxWidth: 120
    },
    {
      field: 'observed_time',
      headerName: 'Time',
      headerAlign: 'right',
      align: 'right',
      maxWidth: 100
    }
  ];

  return (
    <LoadingGuard
      isLoading={props.isLoading}
      isLoadingFallback={
        <Box flex="1 1 auto">
          <SkeletonTable />
        </Box>
      }
      hasNoData={!rows.length}
      hasNoDataFallback={
        <Box flex="1 1 auto">
          <NoDataOverlay
            height="100%"
            title="Add Habitat Features"
            // TODO: Mac: Replace the subtitle with the correct language
            subtitle="Add habitat features that you have observed in the survey area"
            icon={mdiArrowTopRight}
          />
        </Box>
      }>
      <Box flex="1 1 auto" overflow="hidden">
        <StyledDataGrid
          noRowsMessage="No habitat features found"
          columnHeaderHeight={rowHeight}
          rowHeight={rowHeight}
          rows={rows}
          getRowId={(row) => row.survey_habitat_feature_id}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 }
            }
          }}
          pageSizeOptions={[10, 25, 50]}
          rowSelection={false}
          autoHeight={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          disableVirtualization
          sortingOrder={['asc', 'desc']}
          data-testid="survey-habitat-features-data-table"
        />
      </Box>
    </LoadingGuard>
  );
};
