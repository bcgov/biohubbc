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
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { ListProjectsI18N } from 'constants/i18n';
import { REGION_COLOURS } from 'constants/regions';
import { SYSTEM_ROLE } from 'constants/roles';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getCodesName } from 'utils/Utils';
import ProjectsListFilterForm from './ProjectsListFilterForm';

/**
 * `Natural Resource Regions` appended text
 * ie: `Cariboo Natural Resource Region`
 *
 */
export const NRM_REGION_APPENDED_TEXT = ' Natural Resource Region';

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

interface IProjectsListContainerProps {
  showSearch: boolean;
}

const pageSizeOptions = [10, 25, 50];

const tableHeight = '589px';

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListContainer = (props: IProjectsListContainerProps) => {
  const { showSearch } = props;

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IProjectAdvancedFilters | undefined>(undefined);

  const biohubApi = useBiohubApi();

  const codesContext = useCodesContext();
  const taxonomyContext = useTaxonomyContext();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, []);

  const projectsDataLoader = useDataLoader(
    (pagination: ApiPaginationRequestOptions, filter?: IProjectAdvancedFilters) => {
      return biohubApi.project.getProjectsList(pagination, filter);
    }
  );

  useDataLoaderError(projectsDataLoader, (dataLoader) => {
    return {
      dialogTitle: ListProjectsI18N.listProjectsErrorDialogTitle,
      dialogText: ListProjectsI18N.listProjectsErrorDialogText,
      dialogError: (dataLoader.error as APIError).message,
      dialogErrorDetails: (dataLoader.error as APIError).errors
    };
  });

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
      width: 50,
      minWidth: 50,
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
                <Typography variant="body2" color={grey[500]} fontStyle="italic">
                  No Surveys
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

  // Refresh projects when pagination or sort changes
  useEffect(() => {
    const sort = firstOrNull(sortModel);
    const pagination = {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };

    projectsDataLoader.refresh(pagination, advancedFiltersModel);

    // Adding a DataLoader as a dependency causes an infinite rerender loop if a useEffect calls `.refresh`
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortModel, paginationModel, advancedFiltersModel]);

  /**
   * Displays project list.
   */
  return (
    <>
      <Collapse in={showSearch}>
        <ProjectsListFilterForm
          handleSubmit={setAdvancedFiltersModel}
          handleReset={() => setAdvancedFiltersModel(undefined)}
        />
        <Divider />
      </Collapse>
      <Box p={2}>
        <StyledDataGrid
          noRowsMessage="No projects found"
          rowHeight={70}
          getRowHeight={() => 'auto'}
          getEstimatedRowHeight={() => 500}
          rows={projectRows}
          rowCount={projectsDataLoader.data?.pagination.total ?? 0}
          getRowId={(row) => row.project_id}
          columns={columns}
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

export default ProjectsListContainer;
