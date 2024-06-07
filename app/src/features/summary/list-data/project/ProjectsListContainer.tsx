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
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { getNrmRegionColour } from 'constants/regions';
import { SYSTEM_ROLE } from 'constants/roles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import ProjectsListFilterForm from './ProjectsListFilterForm';

// Supported URL parameters for the project table
type ProjectDataTableURLParams = {
  // search filter
  keyword: string;
  species: string;
  person: string;
  // pagination
  p_page: string;
  p_limit: string;
  p_sort?: string;
  p_order?: 'asc' | 'desc';
};

/**
 * `Natural Resource Regions` appended text
 * ie: `Cariboo Natural Resource Region`
 */
export const NRM_REGION_APPENDED_TEXT = ' Natural Resource Region';

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

interface IProjectsListContainerProps {
  showSearch: boolean;
}

const rowHeight = 70;
const tableHeight = rowHeight * 5.5;

// Default pagination parameters
const initialPaginationParams: Required<ApiPaginationRequestOptions> = {
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

  const { searchParams } = useSearchParams<ProjectDataTableURLParams>();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Number(searchParams.get('p_limit') ?? initialPaginationParams.limit),
    page: Number(searchParams.get('p_page') ?? initialPaginationParams.page)
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([
    {
      field: searchParams.get('p_sort') ?? initialPaginationParams.sort,
      sort: (searchParams.get('p_order') ?? initialPaginationParams.order) as GridSortDirection
    }
  ]);

  // Advanced filters state
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IProjectAdvancedFilters>();

  console.log(advancedFiltersModel);

  const sort = firstOrNull(sortModel);
  const paginationSort: ApiPaginationRequestOptions = {
    limit: paginationModel.pageSize,
    sort: sort?.field || undefined,
    order: sort?.sort || undefined,
    // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
    page: paginationModel.page + 1
  };

  const projectsDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: IProjectAdvancedFilters) => {
      return biohubApi.project.getProjectsForUserId(pagination, filter);
    }
  );

  const getProjectPrograms = (project: IProjectsListItemData) => {
    return (
      codesContext.codesDataLoader.data?.program
        .filter((code) => project.project_programs.includes(code.id))
        .map((code) => code.name)
        .join(', ') || ''
    );
  };

  // Fetch/cache all taxonomic data for the projects on the current page
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (projectsDataLoader.data) {
        // fetch all unique itis_tsn's from project focal species
        const taxonomicIds = [
          ...new Set(projectsDataLoader.data.projects.flatMap((item) => item.focal_species))
        ].filter((tsns: number) => tsns !== null);
        if (taxonomicIds.length > 0) {
          await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
        }
      }
    };

    cacheTaxonomicData();
    // Should not re-run this effect on `taxonomyContext` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectsDataLoader.data]);

  useEffect(() => {
    projectsDataLoader.load(paginationSort, advancedFiltersModel);
    // Should not re-run this effect on `projectsDataLoader` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedFiltersModel, paginationSort]);

  const projectRows =
    projectsDataLoader.data?.projects.map((project) => {
      return {
        ...project,
        project_programs: getProjectPrograms(project)
      };
    }) ?? [];

  const columns: GridColDef<IProjectsListTableRow>[] = [
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
          })}{' '}
        </Stack>
      )
    }
  ];

  /**
   * Displays project list.
   */
  return (
    <>
      <Collapse in={showSearch}>
        <ProjectsListFilterForm
          paginationSort={paginationSort}
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel({})}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No projects found"
          rowHeight={rowHeight}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => rowHeight}
          rows={projectRows}
          rowCount={projectsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.project_id}
          loading={!projectsDataLoader.data}
          columns={columns}
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
              height: tableHeight,
              overflowY: 'auto !important',
              overflowX: 'hidden',
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

export default ProjectsListContainer;
