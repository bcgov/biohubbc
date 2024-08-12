import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import { GridColDef } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ISamplingSiteRowData } from 'features/surveys/sampling-information/sites/table/SamplingSiteTable';
import { Feature } from 'geojson';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';

export interface ISurveySitesRowData {
  id: number;
  name: string;
  description: string;
  geojson: Feature;
  blocks: string[];
  stratums: string[];
}

export interface ISurveySitesTableProps {
  sites: ISurveySitesRowData[];
}

export const SurveySitesTable = (props: ISurveySitesTableProps) => {
  const { sites } = props;

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
            label={getSamplingSiteSpatialType(params.row.geojson) ?? 'Unknown'}
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
      initialState={{
        pagination: {
          paginationModel: { page: 1, pageSize: 10 }
        }
      }}
      pageSizeOptions={[10, 25, 50]}
    />
  );
};
