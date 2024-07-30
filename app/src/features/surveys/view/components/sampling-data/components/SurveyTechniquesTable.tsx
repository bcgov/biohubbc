import { mdiArrowTopRight } from '@mdi/js';
import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import Typography from '@mui/material/Typography';
import { GridColDef, GridOverlay } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { useCodesContext } from 'hooks/useContext';
import { IGetTechniqueResponse, IGetTechniquesResponse } from 'interfaces/useTechniqueApi.interface';
import { getCodesName } from 'utils/Utils';

export interface ISurveyTechniquesTableProps {
  techniques?: IGetTechniquesResponse;
}

export const SurveyTechniquesTable = (props: ISurveyTechniquesTableProps) => {
  const { techniques } = props;

  const codesContext = useCodesContext();

  const rows =
    techniques?.techniques.map((technique) => ({
      id: technique.method_technique_id,
      name: getCodesName(codesContext.codesDataLoader.data, 'sample_methods', technique.method_lookup_id) ?? '',
      method_lookup_id: technique.method_lookup_id,
      description: technique.description
    })) || [];

  const columns: GridColDef<IGetTechniqueResponse>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 0.3
    },
    {
      field: 'method_lookup_id',
      flex: 0.3,
      headerName: 'Method',
      renderCell: (params) => (
        <ColouredRectangleChip
          label={getCodesName(codesContext.codesDataLoader.data, 'sample_methods', params.row.method_lookup_id) ?? ''}
          colour={blueGrey}
        />
      )
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
      noRowsMessage={'No Techniques'}
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
            title="Start by Adding a Technique"
            subtitle="Add techniques, then apply your techniques to sampling sites"
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
