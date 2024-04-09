import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { GridColDef, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { StyledDataGrid } from 'components/data-grid/StyledDataGrid';
import PageHeader from 'components/layout/PageHeader';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { ListProjectsI18N } from 'constants/i18n';
import { SYSTEM_ROLE } from 'constants/roles';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull, getFormattedDate } from 'utils/Utils';
import ProjectsListFilterForm from './ProjectsListFilterForm';

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

const pageSizeOptions = [10, 25, 50];

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage = () => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });

  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [advancedFiltersModel, setAdvancedFiltersModel] = useState<IProjectAdvancedFilters | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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
      field: 'project_programs',
      headerName: 'Programs',
      flex: 1
    },
    {
      field: 'regions',
      headerName: 'Regions',
      flex: 1
    },
    {
      field: 'start_date',
      headerName: 'Start Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
    },
    {
      field: 'end_date',
      headerName: 'End Date',
      minWidth: 150,
      valueGetter: ({ value }) => (value ? new Date(value) : undefined),
      valueFormatter: ({ value }) => (value ? getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, value) : undefined)
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
      <PageHeader
        title="Projects"
        buttonJSX={
          <SystemRoleGuard
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.PROJECT_CREATOR, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              component={RouterLink}
              to={'/admin/projects/create'}>
              Create Project
            </Button>
          </SystemRoleGuard>
        }
      />

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Paper>
          <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h4" component="h2">
              Records Found &zwnj;
              <Typography
                component="span"
                color="textSecondary"
                lineHeight="inherit"
                fontSize="inherit"
                fontWeight={400}>
                ({Number(projectsDataLoader.data?.pagination.total || 0).toLocaleString()})
              </Typography>
            </Typography>
            <Button
              variant="text"
              color="primary"
              startIcon={<Icon path={mdiFilterOutline} size={0.8} />}
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}>
              {!showAdvancedFilters ? 'Show Filters' : 'Hide Filters'}
            </Button>
          </Toolbar>
          <Divider></Divider>
          <Collapse in={showAdvancedFilters}>
            <ProjectsListFilterForm
              handleSubmit={setAdvancedFiltersModel}
              handleReset={() => setAdvancedFiltersModel(undefined)}
            />
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
        </Paper>
      </Container>
    </>
  );
};

export default ProjectsListPage;
