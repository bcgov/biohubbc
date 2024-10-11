import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ISamplingSiteRowData } from 'features/surveys/sampling-information/sites/table/SamplingSiteTable';
import { IGetSampleLocationNonSpatialDetails } from 'interfaces/useSamplingSiteApi.interface';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';

export interface ISurveySitesRowData {
  id: number;
  name: string;
  description: string;
  geometry_type: string;
  blocks: string[];
  stratums: string[];
}

export interface ISurveySitesTableProps {
  sites: IGetSampleLocationNonSpatialDetails[];
  paginationModel: GridPaginationModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  sortModel: GridSortModel;
  pageSizeOptions: number[];
  handleRefresh: () => void;
}

export const SurveySitesTable = (props: ISurveySitesTableProps) => {
  const { sites, paginationModel, setPaginationModel, sortModel, setSortModel, pageSizeOptions, handleRefresh } = props;

  const columns: GridColDef<ISamplingSiteRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'geometry_type',
      headerName: 'Geometry',
      flex: 1,
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
      flex: 1,
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
      flex: 1,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.stratums.map((stratum) => (
            <Box key={stratum} mr={1} mb={1}>
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
      autoHeight
      getRowHeight={() => 'auto'}
      rows={sites}
      getRowId={(row) => row.id}
      columns={columns}
      disableRowSelectionOnClick
      onPaginationModelChange={setPaginationModel}
      onSortModelChange={setSortModel}
      sortModel={sortModel}
      paginationModel={paginationModel}
      initialState={{
        pagination: {
          paginationModel
        }
      }}
      pageSizeOptions={pageSizeOptions}
    />
  );
};
