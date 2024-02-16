import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Link, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { grey } from '@mui/material/colors';
import { makeStyles } from '@mui/styles';
import { DataGrid, GridColDef, GridOverlay } from '@mui/x-data-grid';
import { ProjectRoleGuard } from 'components/security/Guards';
import { H2ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { PROJECT_PERMISSION, SYSTEM_ROLE } from 'constants/roles';
import { ProjectContext } from 'contexts/projectContext';
import { SurveyBasicFieldsObject } from 'interfaces/useSurveyApi.interface';
import { useCallback, useContext } from 'react';
import { useHistory } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

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
  const history = useHistory();
  const projectContext = useContext(ProjectContext);

  const navigateToCreateSurveyPage = (projectId: number) => {
    history.push(`/admin/projects/${projectId}/survey/create`);
  };

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
    // TODO add focal species column
  ];

  const NoRowsOverlayStyled = useCallback(() => <NoRowsOverlay className={classes.noDataText} />, [classes.noDataText]);

  return (
    <>
      <H2ButtonToolbar
        label="Surveys"
        buttonLabel="Create Survey"
        buttonTitle="Create Survey"
        buttonStartIcon={<Icon path={mdiPlus} size={1} />}
        buttonProps={{ variant: 'contained', disableElevation: true }}
        // TODO use RouterLink
        buttonOnClick={() => navigateToCreateSurveyPage(projectContext.projectId)}
        renderButton={(buttonProps) => (
          <ProjectRoleGuard
            validProjectPermissions={[PROJECT_PERMISSION.COORDINATOR, PROJECT_PERMISSION.COLLABORATOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button {...buttonProps} />
          </ProjectRoleGuard>
        )}
      />
      <Divider></Divider>
      <Box py={1} pb={2} px={3}>
        <DataGrid
          className={classes.dataGrid}
          columns={columns}
          autoHeight
          rows={projectContext.surveysListDataLoader.data?.surveys ?? []}
          // rowCount={projectsDataLoader.data?.pagination.total}
          getRowId={(row) => row.survey_id}
          pageSizeOptions={[...pageSizeOptions]}
          paginationMode="server"
          sortingMode="server"
          // sortModel={sortModel}
          // paginationModel={paginationModel}
          // onPaginationModelChange={setPaginationModel}
          // onSortModelChange={setSortModel}
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
