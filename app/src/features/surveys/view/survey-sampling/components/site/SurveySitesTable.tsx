import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ISamplingSiteRowData } from 'features/surveys/sampling-information/sites/table/SamplingSiteTable';
import { IFindSampleSiteRecord } from 'interfaces/useSamplingSiteApi.interface';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';

const pageSizeOptions = [10, 25, 50];

export interface ISurveySitesTableProps {
  sites: IFindSampleSiteRecord[];
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  sortModel: GridSortModel;
  rowCount: number;
}

/**
 * Renders a table of survey sampling sites.
 *
 * @param {ISurveySitesTableProps} props
 * @return {*}
 */
export const SurveySitesTable = (props: ISurveySitesTableProps) => {
  const { sites, paginationModel, setPaginationModel, sortModel, setSortModel, rowCount } = props;

  const rows: ISamplingSiteRowData[] = sites.map((site) => ({
    id: site.survey_sample_site_id,
    name: site.name,
    geometry_type: site.geometry_type,
    description: site.description || '',
    blocks: site.blocks.map((block) => block.name),
    stratums: site.stratums.map((stratum) => stratum.name)
  }));

  const columns: GridColDef<ISamplingSiteRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'geometry_type',
      headerName: 'Geometry',
      flex: 0.75,
      renderCell: (params) => (
        <Box>
          <ColouredRectangleChip
            label={getSamplingSiteSpatialType(params.row.geometry_type) ?? 'Unknown'}
            colour={blueGrey}
          />
        </Box>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1
    },
    {
      field: 'blocks',
      headerName: 'Blocks',
      flex: 0.75,
      sortable: false, // TODO not yet supported by the API
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.blocks.map((block) => (
            <Box key={block} mr={1} mb={1}>
              <ColouredRectangleChip label={block} colour={blueGrey} />
            </Box>
          ))}
        </Box>
      )
    },
    {
      field: 'stratums',
      headerName: 'Strata',
      flex: 0.75,
      sortable: false, // TODO not yet supported by the API
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.stratums.map((stratum) => (
            <Box key={stratum} mr={1} mb={1} sx={{ maxWidth: '14ch' }}>
              <ColouredRectangleChip label={stratum} colour={blueGrey} />
            </Box>
          ))}
        </Box>
      )
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage={'No Sites'}
      rowSelection={false}
      autoHeight={false}
      getRowHeight={() => 'auto'}
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      disableRowSelectionOnClick
      onPaginationModelChange={setPaginationModel}
      onSortModelChange={setSortModel}
      sortModel={sortModel}
      paginationModel={paginationModel}
      paginationMode="server"
      sortingMode="server"
      rowCount={rowCount}
      initialState={{
        pagination: {
          paginationModel
        }
      }}
      pageSizeOptions={pageSizeOptions}
    />
  );
};
