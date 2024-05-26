import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import blueGrey from '@mui/material/colors/blueGrey';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { REGION_COLOURS } from 'constants/regions';
import { NRM_REGION_APPENDED_TEXT } from 'features/projects/list/ProjectsListContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getFormattedDate } from 'utils/Utils';
import SurveyProgressChip from '../components/SurveyProgressChip';
import SurveysListFilterForm from './SurveysListFilterForm';

export interface ISurveyAdvancedFilters {
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  system_user_id: string;
  itis_tsns: number[];
}

const pageSizeOptions = [10, 25, 50];

interface ISurveysListContainerProps {
  showSearch: boolean;
}

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveysListContainer = (props: ISurveysListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ISurveyAdvancedFilters | undefined>(undefined);

  const surveysDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions, filter?: ISurveyAdvancedFilters) =>
    biohubApi.survey.getSurveysList(pagination, filter)
  );

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    const sort = firstOrNull(sortModel);
    const pagination: ApiPaginationRequestOptions = {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };

    surveysDataLoader.refresh(pagination, advancedFiltersModel);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel, advancedFiltersModel]);

  const surveyRows = surveysDataLoader.data?.surveys;

  const columns: GridColDef<SurveyBasicFieldsObject>[] = [
    {
      field: 'survey_id',
      headerName: 'ID',
      sortable: false,
      flex: 0.1,
      renderHeader: () => (
        <Typography color={grey[500]} variant="body2" fontWeight={700}>
          ID
        </Typography>
      ),
      renderCell: (params) => (
        <Typography color={grey[500]} variant="body2">
          {params.row.survey_id}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 200,
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
          data-testid={params.row.name}
          underline="always"
          title={params.row.name}
          component={RouterLink}
          to={`/admin/projects/${params.row.project_id}/surveys/${params.row.survey_id}`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'project_id',
      headerName: 'Project',
      minWidth: 70,
      flex: 0.15,
      renderHeader: () => (
        <Typography
          color={grey[500]}
          variant="body2"
          fontWeight={700}
          sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          PROJECT ID
        </Typography>
      ),
      renderCell: (params) => (
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
          data-testid={params.row.name}
          underline="always"
          title={params.row.name}
          component={RouterLink}
          to={`/admin/projects/${params.row.project_id}`}
          children={params.row.project_id}
        />
      )
    },

    {
      field: 'progress_id',
      headerName: 'Progress',
      minWidth: 40,
      flex: 0.25,
      disableColumnMenu: true,
      renderCell: (params) => <SurveyProgressChip progress_id={params.row.progress_id} />
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.start_date)}</Typography>
      )
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      minWidth: 50,
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.row.end_date ? (
          <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.end_date)}</Typography>
        ) : (
          <Typography variant="body2" color="textSecondary">
            None
          </Typography>
        )
    },
    {
      field: 'regions',
      headerName: 'Region',
      minWidth: 50,
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {params.row.regions.map((region) => {
            const label = region.replace(NRM_REGION_APPENDED_TEXT, '');
            return (
              <ColouredRectangleChip
                key={region}
                colour={REGION_COLOURS.find((colour) => colour.region === label)?.color ?? blueGrey}
                label={label}
              />
            );
          })}{' '}
        </Stack>
      )
    }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <SurveysListFilterForm
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(undefined)}
        />
        <Divider />
      </Collapse>
      <Box p={2} sx={{ overflowY: 'auto' }}>
        <StyledDataGrid
          noRowsMessage="No surveys found"
          columns={columns}
          rowHeight={70}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 500}
          rows={surveyRows ?? []}
          rowCount={surveysDataLoader.data?.surveys.length ?? 0}
          getRowId={(row) => row.survey_id}
          pageSizeOptions={[...pageSizeOptions]}
          paginationMode="server"
          sortingMode="server"
          sortModel={sortModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          onSortModelChange={setSortModel}
          rowSelection={false}
          checkboxSelection={false}
          sx={{
            overflow: 'auto',
            minWidth: '1000px'
          }}
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          sortingOrder={['asc', 'desc']}
        />
      </Box>
    </>
  );
};

export default SurveysListContainer;
