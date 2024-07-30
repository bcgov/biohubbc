import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { IGetSampleSiteResponse } from 'interfaces/useSamplingSiteApi.interface';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';

export interface ISurveySitesTableProps {
  sites?: IGetSampleSiteResponse;
}

export const SurveySitesTable = (props: ISurveySitesTableProps) => {
  const { sites } = props;

  const rows =
    sites?.sampleSites.map((site) => ({
      id: site.survey_sample_site_id,
      name: site.name,
      description: site.description
    })) || [];

  const columns: GridColDef<IGetTechniqueResponse>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 1,
      renderCell: (params) => {
        return (
          <Box alignItems="flex-start">
            <Typography
              color="textSecondary"
              variant="body2"
              flex="0.4"
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
              {params.row.description}
            </Typography>
          </Box>
        );
      }
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
            subtitle="Sampling Sites show where techniques were implemented"
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
