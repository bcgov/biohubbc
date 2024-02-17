import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import PageHeader from 'components/layout/PageHeader';
import { IProjectAdvancedFilters } from 'components/search-filter/ProjectAdvancedFilters';
import { SystemRoleGuard } from 'components/security/Guards';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SYSTEM_ROLE } from 'constants/roles';
import { CodesContext } from 'contexts/codesContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IProjectsListItemData } from 'interfaces/useProjectApi.interface';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationOptions } from 'types/misc';
import { firstOrNull, getFormattedDate } from 'utils/Utils';
import ProjectsListFilterForm from './ProjectsListFilterForm';

const useStyles = makeStyles((theme: Theme) => ({
  projectsTable: {
    tableLayout: 'fixed'
  },
  linkButton: {
    textAlign: 'left',
    fontWeight: 700
  },
  noDataText: {
    fontFamily: 'inherit !important',
    fontSize: '0.875rem',
    fontWeight: 700
  },
  dataGrid: {
    border: 'none !important',
    fontFamily: 'inherit !important',
    '& .MuiDataGrid-columnHeaderTitle': {
      textTransform: 'uppercase',
      fontSize: '0.875rem',
      fontWeight: 700,
      color: grey[600]
    },
    '& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeader:focus-within':
      {
        outline: 'none !important'
      },
    '& .MuiDataGrid-row:hover': {
      backgroundColor: 'transparent !important'
    }
  }
}));

interface IProjectsListTableRow extends Omit<IProjectsListItemData, 'project_programs'> {
  project_programs: string;
}

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary">
      No projects found
    </Typography>
  </GridOverlay>
);

const pageSizeOptions = [10, 25, 50];

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage = () => {
  const classes = useStyles();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const biohubApi = useBiohubApi();

  const codesContext = useContext(CodesContext);
  const projectsDataLoader = useDataLoader((pagination: ApiPaginationOptions, filter?: IProjectAdvancedFilters) => {
    return biohubApi.project.getProjectsList(pagination, filter);
  });

  const getProjectPrograms = (project: IProjectsListItemData) => {
    return (
      codesContext.codesDataLoader.data?.program
        .filter((code) => project.project_programs.includes(code.id))
        .map((code) => code.name)
        .join(', ') || ''
    );
  };

  codesContext.codesDataLoader.load();

  // TODO unnecesssary
  const handleSubmit = async (filterValues: IProjectAdvancedFilters) => {
    refreshProjectsList(filterValues);
  };

  const handleReset = async () => {
    refreshProjectsList();
  };

  const refreshProjectsList = (filterValues?: IProjectAdvancedFilters) => {
    const sort = firstOrNull(sortModel);
    const pagination = {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };

    return projectsDataLoader.refresh(pagination, filterValues);
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
          style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
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

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  // Refresh projects when pagination or sort changes
  useEffect(() => {
    refreshProjectsList();
  }, [sortModel, paginationModel]);

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

      <Container maxWidth="xl">
        <Box py={3}>
          <Paper elevation={0}>
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
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                {!isFiltersOpen ? `Show Filters` : `Hide Filters`}
              </Button>
            </Toolbar>
            <Divider></Divider>
            {isFiltersOpen && <ProjectsListFilterForm handleSubmit={handleSubmit} handleReset={handleReset} />}
            <Box py={1} pb={2} px={3}>
              <DataGrid
                className={classes.dataGrid}
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
                slots={{
                  noRowsOverlay: NoRowsOverlayStyled
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Container>
    </>
  );
};

export default ProjectsListPage;
