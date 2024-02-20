import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Link, Toolbar, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { ProjectRoleGuard } from 'components/security/Guards';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { ApiPaginationRequestOptions } from 'types/misc';
import { firstOrNull } from 'utils/Utils';

const pageSizeOptions = [10, 25, 50];

const useStyles = makeStyles(() => ({
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

const NoRowsOverlay = (props: { className: string }) => (
  <GridOverlay>
    <Typography className={props.className} color="textSecondary">
      No surveys found
    </Typography>
  </GridOverlay>
);

/**
 * List of Surveys belonging to a Project.
 *
 * @return {*}
 */
const SurveysListPage = () => {
  const classes = useStyles();
  const projectContext = useContext(ProjectContext);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: pageSizeOptions[0]
  });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const refreshSurveyList = () => {
    const sort = firstOrNull(sortModel);
    const pagination: ApiPaginationRequestOptions = {
      limit: paginationModel.pageSize,
      sort: sort?.field || undefined,
      order: sort?.sort || undefined,

      // API pagination pages begin at 1, but MUI DataGrid pagination begins at 0.
      page: paginationModel.page + 1
    };

    return projectContext.surveysListDataLoader.refresh(pagination);
  };

  // Refresh survey list when pagination or sort changes
  useEffect(() => {
    refreshSurveyList();
  }, [sortModel, paginationModel]);

  const columns: GridColDef<SurveyBasicFieldsObject>[] = [
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
          to={`/admin/projects/${projectContext.projectId}/surveys/${params.row.survey_id}`}
          children={params.row.name}
        />
      )
    },
    {
      field: 'focal_species_names',
      headerName: 'Focal Species',
      flex: 1,
      disableColumnMenu: true,
      sortable: false,
      renderCell: (params) => <Typography>{params.value.join(', ')}</Typography>
    }
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  return (
    <>
      <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h4" component="h2">
          Surveys &zwnj;
          <Typography
            component="span"
            color="textSecondary"
            lineHeight="inherit"
            fontSize="inherit"
            fontWeight={400}>
            ({Number(projectContext.surveysListDataLoader.data?.pagination.total || 0).toLocaleString()})
          </Typography>
        </Typography>
        <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            // TODO fix filters
            // onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            component={RouterLink}
            to={`/admin/projects/${projectContext.projectId}/survey/create`}>
            Create Survey
          </Button>
        </ProjectRoleGuard>
      </Toolbar>
      <Divider></Divider>
      <Box py={1} pb={2} px={3}>
        <DataGrid
          className={classes.dataGrid}
          columns={columns}
          autoHeight
          rows={projectContext.surveysListDataLoader.data?.surveys ?? []}
          rowCount={projectContext.surveysListDataLoader.data?.pagination.total ?? 0}
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
          slots={{
            noRowsOverlay: NoRowsOverlayStyled
          }}
        />
      </Box>
    </>
  );
};

export default SurveysListPage;
