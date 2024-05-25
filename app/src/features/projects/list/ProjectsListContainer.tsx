import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { ListProjectsI18N } from 'constants/i18n';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';
import ProjectsListFilterForm from './ProjectsListFilterForm';

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

interface IProjectsListContainerProps {
  showSearch: boolean;
}

const pageSizeOptions = [10, 25, 50];

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

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

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

  const projectRows =
    projectsDataLoader.data?.projects.map((project) => {
      return {
        ...project,
        project_programs: getProjectPrograms(project)
      };
    }) ?? [];

  const columns: GridColDef<IProjectsListTableRow>[] = [
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
          to={`/admin/projects/${params.row.project_id}`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'regions',
      headerName: 'Regions',
      flex: 1
    },
    {
      field: 'project_programs',
      headerName: 'Programs',
      flex: 0.5
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
          autoHeight
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
        />
      </Box>
    </>
  );
};

export default ProjectsListContainer;
