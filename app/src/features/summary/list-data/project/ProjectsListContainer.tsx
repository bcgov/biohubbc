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
import { getNrmRegionColour, NRM_REGION_APPENDED_TEXT } from 'constants/regions';
import { SYSTEM_ROLE } from 'constants/roles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { useSearchParams } from 'hooks/useSearchParams';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions, StringValues } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import ProjectsListFilterForm, {
  IProjectAdvancedFilters,
  ProjectAdvancedFiltersInitialValues
} from './ProjectsListFilterForm';

// Supported URL parameters
type ProjectDataTableURLParams = {
  // filter
  p_keyword?: string;
  p_itis_tsn?: number;
  p_system_user_id?: string;
  // pagination
  p_page?: string;
  p_limit?: string;
  p_sort?: string;
  p_order?: 'asc' | 'desc';
};

const pageSizeOptions = [10, 25, 50];

interface IProjectsListContainerProps {
  showSearch: boolean;
}

// Default pagination parameters
const ApiPaginationRequestOptionsInitialValues: Required<ApiPaginationRequestOptions> = {
  page: 0,
  limit: 10,
  sort: 'project_id',
  order: 'desc'
};

/**
 * Displays a list of projects.
 *
 * @return {*}
 */
const ProjectsListContainer = (props: IProjectsListContainerProps) => {
  const { showSearch } = props;

  const biohubApi = useBiohubApi();
  const codesContext = useCodesContext();
  const taxonomyContext = useTaxonomyContext();

  const { searchParams, setSearchParams } = useSearchParams<StringValues<ProjectDataTableURLParams>>();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('p_limit') ?? ApiPaginationRequestOptionsInitialValues.limit),
    page: Number(searchParams.get('p_page') ?? ApiPaginationRequestOptionsInitialValues.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('p_sort') ?? ApiPaginationRequestOptionsInitialValues.sort,
      sort: (searchParams.get('p_order') ?? ApiPaginationRequestOptionsInitialValues.order) as GridSortDirection
    }
  ]);

  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IProjectAdvancedFilters>({
    keyword: searchParams.get('p_keyword') ?? ProjectAdvancedFiltersInitialValues.keyword,
    itis_tsn: searchParams.get('p_itis_tsn')
      ? Number(searchParams.get('p_itis_tsn'))
      : ProjectAdvancedFiltersInitialValues.itis_tsn,
    system_user_id: searchParams.get('p_system_user_id') ?? ProjectAdvancedFiltersInitialValues.system_user_id
  });

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = useMemo(
    () => ({
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,
      page: paginationModel.page + 1 // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    }),
    [paginationModel.page, paginationModel.pageSize, sort?.field, sort?.sort]
  );

  const { refresh, isReady, data } = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: IProjectAdvancedFilters) =>
      biohubApi.project.findProjects(pagination, filter)
  );

  // Fetch projects when either the pagination, sort, or advanced filters change
  useDeepCompareEffect(() => {
    refresh(paginationSort, advancedFiltersModel);
  }, [advancedFiltersModel, paginationSort]);

  const rows = data?.projects ?? [];

  // Define the columns for the DataGrid
  const columns: GridColDef<IProjectsListItemData>[] = [
    {
      field: 'project_id',
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
          {params.row.project_id}
        </Typography>
      )
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      disableColumnMenu: true,
      renderCell: (params) => {
        const focalSpecies = params.row.focal_species
          .map((species) => taxonomyContext.getCachedSpeciesTaxonomyById(species)?.commonNames)
          .filter(Boolean)
          .join(' \u2013 '); // n-dash with spaces

        const types = params.row.types
          .map((type) => getCodesName(codesContext.codesDataLoader.data, 'type', type || 0))
          .filter(Boolean)
          .join(' \u2013 '); // n-dash with spaces

        const detailsArray = [focalSpecies, types].filter(Boolean).join(' \u2013 ');

        return (
          <Stack mb={0.25}>
            <Link
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 700 }}
              data-testid={params.row.name}
              underline="always"
              title={params.row.name}
              component={RouterLink}
              to={`/admin/projects/${params.row.project_id}`}
              children={params.row.name}
            />
            {/* Only administrators see the second title to help them find Projects with a standard naming convention */}
            <SystemRoleGuard validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
              {detailsArray.length > 0 ? (
                <Typography variant="body2" color="textSecondary">
                  {detailsArray}
                </Typography>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  There are no Surveys in this Project
                </Typography>
              )}
            </SystemRoleGuard>
          </Stack>
        );
      }
    },
    {
      field: 'regions',
      headerName: 'Region',
      type: 'string',
      flex: 0.4,
      renderCell: (params) => (
        <Stack direction="row" gap={1} flexWrap="wrap">
          {params.row.regions.map((region) => {
            const label = region.replace(NRM_REGION_APPENDED_TEXT, '');
            return <ColouredRectangleChip key={region} colour={getNrmRegionColour(region)} label={label} />;
          })}
        </Stack>
      )
    }
  ];

  return (
    <>
      <Collapse in={showSearch}>
        <Box py={2} px={3} bgcolor={grey[50]}>
          <ProjectsListFilterForm
            initialValues={advancedFiltersModel}
            handleSubmit={(values) => {
              setSearchParams(
                searchParams
                  .setOrDelete('p_keyword', values.keyword)
                  .setOrDelete('p_itis_tsn', values.itis_tsn)
                  .setOrDelete('p_system_user_id', values.system_user_id)
              );
              setAdvancedFiltersModel(values);
            }}
          />
        </Box>
        <Divider />
      </Collapse>
      <Box height="500px">
        <StyledDataGrid
          noRowsMessage="No projects found"
          loading={!isReady && !data}
          // Columns
          columns={columns}
          // Rows
          rows={rows}
          rowCount={data?.pagination.total ?? 0}
          getRowId={(row) => row.project_id}
          // Pagination
          paginationMode="server"
          paginationModel={paginationModel}
          pageSizeOptions={pageSizeOptions}
          onPaginationModelChange={(model) => {
            if (!model) {
              return;
            }
            setSearchParams(searchParams.set('p_page', String(model.page)).set('p_limit', String(model.pageSize)));
            setPaginationModel(model);
          }}
          // Sorting
          sortingMode="server"
          sortModel={sortModel}
          sortingOrder={['asc', 'desc']}
          onSortModelChange={(model) => {
            if (!model.length) {
              return;
            }
            setSearchParams(searchParams.set('p_sort', model[0].field).set('p_order', model[0].sort ?? 'desc'));
            setSortModel(model);
          }}
          // Row options
          rowSelection={false}
          checkboxSelection={false}
          disableRowSelectionOnClick
          // Column options
          disableColumnSelector
          disableColumnFilter
          disableColumnMenu
          // Styling
          rowHeight={70}
          getRowHeight={() => 'auto'}
          autoHeight={false}
          sx={{
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

export default ProjectsListContainer;