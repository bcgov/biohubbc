import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortDirection, GridSortModel } from '@mui/x-data-grid';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { getNrmRegionColour } from 'constants/regions';
import { SYSTEM_ROLE } from 'constants/roles';
import dayjs from 'dayjs';
import { NRM_REGION_APPENDED_TEXT } from 'features/summary/list-data/project/ProjectsListContainer';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import SurveyProgressChip from '../../../surveys/components/SurveyProgressChip';
import SurveysListFilterForm, {
  ISurveyAdvancedFilters,
  SurveyAdvancedFiltersInitialValues
} from './SurveysListFilterForm';

// Supported URL parameters for the project table
type SurveyDataTableURLParams = {
  // search filter
  keyword: string;
  species: string;
  person: string;
  // pagination
  s_page: string;
  s_limit: string;
  s_sort?: string;
  s_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface ISurveysListContainerProps {
  showSearch: boolean;
}

const rowHeight = 70;
const tableHeight = rowHeight * 5.5;

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'survey_id',
  order: 'desc'
};

/**
 * Displays a list of surveys.
 *
 * @return {*}
 */
const SurveysListContainer = (props: ISurveysListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const taxonomyContext = useTaxonomyContext();

  const { searchParams } = useSearchParams<SurveyDataTableURLParams>();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('s_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('s_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('s_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('s_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<ISurveyAdvancedFilters>(
    SurveyAdvancedFiltersInitialValues
  );

  const surveysDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions, filter?: ISurveyAdvancedFilters) =>
    biohubApi.survey.getSurveysForUserId(pagination, filter)
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
      width: 70,
      minWidth: 70,
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
      renderCell: (params) => {
        const dates = [params.row.start_date?.split('-')[0], params.row.end_date?.split('-')[0]]
          .filter(Boolean)
          .join(' \u2013 '); // n-dash with spaces

        const focalSpecies = params.row.focal_species
          .map((species) => taxonomyContext.getCachedSpeciesTaxonomyById(species)?.commonNames)
          .filter(Boolean)
          .join(' \u2013 '); // n-dash with spaces

        const types = params.row.types
          .map((type) => getCodesName(codesContext.codesDataLoader.data, 'type', type || 0))
          .filter(Boolean)
          .join(' \u2013 '); // n-dash with spaces

        const detailsArray = [dates, focalSpecies, types].filter(Boolean).join(' \u2013 ');

        return (
          <Stack mb={0.25}>
            <Link
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
              data-testid={params.row.name}
              underline="always"
              title={params.row.name}
              component={RouterLink}
              to={`/admin/projects/${params.row.project_id}/surveys/${params.row.survey_id}`}
              children={params.row.name}
            />
            {/* Only administrators see the second title to help them find Projects with a standard naming convention */}
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              <Typography variant="body2" color="textSecondary">
                {detailsArray}
              </Typography>
            </SystemRoleGuard>
          </Stack>
        );
      }
    },
    {
      field: 'progress_id',
      headerName: 'Progress',
      flex: 0.2,
      disableColumnMenu: true,
      renderCell: (params) => <SurveyProgressChip progress_id={params.row.progress_id} />
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      flex: 0.2,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Typography variant="body2">{dayjs(params.row.start_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
      )
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      flex: 0.2,
      disableColumnMenu: true,
      renderCell: (params) =>
        params.row.end_date ? (
          <Typography variant="body2">{dayjs(params.row.end_date).format(DATE_FORMAT.MediumDateFormat)}</Typography>
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
            return <ColouredRectangleChip key={region} colour={getNrmRegionColour(region)} label={label} />;
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
          handleReset={() => setAdvancedFiltersModel(SurveyAdvancedFiltersInitialValues)}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No surveys found"
          columns={columns}
          rowHeight={rowHeight}
          getRowHeight={() => 'auto'}
          rows={surveyRows ?? []}
          rowCount={surveysDataLoader.data?.surveys.length ?? 0}
          loading={!surveysDataLoader.data}
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
          sx={{
            '& .MuiDataGrid-virtualScroller': {
              // Height is an odd number to help the list obviously scrollable by likely cutting off the last visible row
              height: tableHeight,
              overflowX: 'hidden',
              overflowY: 'auto !important',
              background: grey[50]
            },
            '& .MuiDataGrid-overlayWrapperInner': {
              height: `${tableHeight} !important`
            },
            '& .MuiDataGrid-overlay': {
              background: grey[50]
            },
            '& .MuiDataGrid-cell': {
              py: 0.75,
              background: '#fff',
              '&.MuiDataGrid-cell--editing:focus-within': {
                outline: 'none'
              }
            }
          }}
        />
      </Box>
    </>
  );
};

export default SurveysListContainer;
