import { mdiArrowTopRight, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getFormattedDate } from 'utils/Utils';
import { LinearProgressWithLabel } from '../details/tabs/details/checklist/progress/SurveyChecklistProgressBar';

const pageSizeOptions = [10, 25, 50];

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveysListPage = () => {
  const biohubApi = useBiohubApi();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const surveysListDataLoader = useDataLoader((pagination: ApiPaginationRequestOptions) =>
    biohubApi.survey.findSurveys(pagination)
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

    surveysListDataLoader.refresh(pagination);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel]);

  const surveys = surveysListDataLoader.data?.surveys ?? [];

  const columns: GridColDef<SurveyBasicFieldsObject>[] = [
    {
      field: 'survey_id',
      headerName: 'ID',
      width: 85,
      minWidth: 85,
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
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Link
          style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
          data-testid={params.row.name}
          underline="always"
          title={params.row.name}
          component={RouterLink}
          to={`/admin/surveys/${params.row.survey_id}`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'progress_percentage',
      headerName: 'Progress',
      flex: 0.5,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Box flex="1 1 auto" mr={2}>
          <LinearProgressWithLabel value={params.row.progress_percentage} />
        </Box>
      )
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
      flex: 0.3,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2">{getFormattedDate(DATE_FORMAT.MediumDateFormat, params.row.end_date)}</Typography>
      )
    }
  ];

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Surveys &zwnj;
          <Typography component="span" color="textSecondary" lineHeight="inherit" fontSize="inherit" fontWeight={400}>
            ({Number(surveysListDataLoader.data?.pagination?.total ?? 0).toLocaleString()})
          </Typography>
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEYS} />
          <SurveyRoleRouteGuard
            validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              // TODO fix filters
              // onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              component={RouterLink}
              to={`/admin/survey/create`}>
              Create Survey
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>

      <Divider />

      <LoadingGuard
        isLoading={surveysListDataLoader.isLoading || !surveysListDataLoader.isReady}
        isLoadingFallback={<SkeletonTable data-testid="survey-list-skeleton" />}
        isLoadingFallbackDelay={100}
        hasNoData={!surveys.length}
        hasNoDataFallback={
          <NoDataOverlay
            title="Create a Survey"
            subtitle="Start managing ecological data by creating a survey"
            icon={mdiArrowTopRight}
            data-testid="survey-list-no-data-overlay"
          />
        }
        hasNoDataFallbackDelay={100}>
        <StyledDataGrid
          noRowsMessage="No surveys found"
          columns={columns}
          rows={surveys}
          rowCount={surveysListDataLoader.data?.pagination?.total ?? 0}
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
          disableRowSelectionOnClick
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          sortingOrder={['asc', 'desc']}
        />
      </LoadingGuard>
    </>
  );
};

export default SurveysListPage;
