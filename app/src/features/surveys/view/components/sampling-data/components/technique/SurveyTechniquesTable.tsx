import Box from '@mui/material/Box';
import blueGrey from '@mui/material/colors/blueGrey';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { ITechniqueRowData } from 'features/surveys/sampling-information/techniques/table/SamplingTechniqueTable';
import { useCodesContext } from 'hooks/useContext';
import { IGetTechniqueResponse, TechniqueAttractant } from 'interfaces/useTechniqueApi.interface';
import { getCodesName } from 'utils/Utils';

const pageSizeOptions = [10, 25, 50];

export interface ISurveyTechniqueRowData {
  id: number;
  method_lookup_id: number;
  name: string;
  description: string | null;
  attractants: TechniqueAttractant[];
  distance_threshold: number | null;
}

export interface ISurveyTechniquesTableProps {
  techniques: IGetTechniqueResponse[];
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  setPaginationModel: React.Dispatch<React.SetStateAction<GridPaginationModel>>;
  setSortModel: React.Dispatch<React.SetStateAction<GridSortModel>>;
  rowCount: number;
}

export const SurveyTechniquesTable = (props: ISurveyTechniquesTableProps) => {
  const { techniques, paginationModel, setPaginationModel, sortModel, setSortModel, rowCount } = props;

  const codesContext = useCodesContext();

  const rows: ISurveyTechniqueRowData[] =
    techniques.map((technique) => ({
      id: technique.method_technique_id,
      name: technique.name,
      method_lookup_id: technique.method_lookup_id,
      description: technique.description,
      attractants: technique.attractants,
      distance_threshold: technique.distance_threshold
    })) ?? [];

  const columns: GridColDef<ITechniqueRowData>[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'method_lookup_id',
      flex: 1,
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
    },
    {
      field: 'attractants',
      flex: 1,
      headerName: 'Attractants',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {params.row.attractants.map((attractant) => (
            <Box key={attractant.attractant_lookup_id} mr={1} mb={1}>
              <ColouredRectangleChip
                label={
                  getCodesName(codesContext.codesDataLoader.data, 'attractants', attractant.attractant_lookup_id) ?? ''
                }
                colour={blueGrey}
              />
            </Box>
          ))}
        </Box>
      )
    },
    {
      field: 'distance_threshold',
      headerName: 'Distance threshold',
      flex: 1,
      renderCell: (params) => (params.row.distance_threshold ? <>{params.row.distance_threshold}&nbsp;m</> : <></>)
    }
  ];

  return (
    <StyledDataGrid
      noRowsMessage={'No Techniques'}
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
      // TODO: Enable pagination; saving for a separate PR because it should probably include
      // removing techniquesDataLoader from the surveyContext
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
