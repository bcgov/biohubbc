import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ISamplingSiteRowData } from 'features/surveys/sampling-information/sites/manage/table/site/SamplingSiteManageSiteTable';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { getSamplingSiteSpatialType } from 'utils/spatial-utils';

export interface ISurveySitesTableProps {
  sites?: IGetSampleSiteResponse;
}

export const SurveySitesTable = (props: ISurveySitesTableProps) => {
  const { sites } = props;

  const rows: ISamplingSiteRowData[] =
    sites?.sampleSites.map((site) => ({
      id: site.survey_sample_site_id,
      name: site.name,
      description: site.description,
      geojson: site.geojson,
      blocks: site.blocks.map((block) => block.name),
      stratums: site.stratums.map((stratum) => stratum.name)
    })) || [];

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
          {params.row.blocks.map((block, index) => (
            <Box key={index} mr={1} mb={1}>
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
          {params.row.stratums.map((stratum, index) => (
            <Box key={index} mr={1} mb={1}>
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
      rows={rows}
      getRowId={(row) => row.id}
      columns={columns}
      disableRowSelectionOnClick
      noRowsOverlay={
        <GridOverlay>
          <NoDataOverlay
            title="Add Sampling Sites"
            subtitle="Add sampling sites to show where you implemented a technique"
            icon={mdiArrowTopRight}
          />
        </GridOverlay>
      }
      sx={{
        '& .MuiDataGrid-virtualScroller': {
          height: rows.length === 0 ? '250px' : 'unset',
          overflowY: 'auto !important',
          overflowX: 'hidden'
        },
        '& .MuiDataGrid-overlay': {
          height: '250px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      }}
    />
  );
};
