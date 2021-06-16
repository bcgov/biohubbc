import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Divider from '@material-ui/core/Divider';
import { mdiFilterOutline, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetDraftsListResponse } from 'interfaces/useDraftApi.interface';
import { IGetProjectsListResponse } from 'interfaces/useProjectApi.interface';
import React, { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from 'react-router';
import { getFormattedDate } from 'utils/Utils';
import makeStyles from '@material-ui/styles/makeStyles';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ProjectAdvancedFilters, {
  ProjectAdvancedFiltersInitialValues
} from 'components/search-filter/ProjectAdvancedFilters';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';

const useStyles = makeStyles({
  actionButton: {
    width: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  },
  linkButton: {
    textAlign: 'left'
  },
  filtersBox: {
    background: '#f7f8fa'
  }
});

/**
 * Page to display a list of projects.
 *
 * @return {*}
 */
const ProjectsListPage: React.FC = () => {
  const history = useHistory();
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [projects, setProjects] = useState<IGetProjectsListResponse[]>([]);
  const [drafts, setDrafts] = useState<IGetDraftsListResponse[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dialogContext = useContext(DialogContext);
  const projectCount = projects.length;

  const navigateToCreateProjectPage = (draftId?: number) => {
    if (draftId) {
      history.push(`/projects/create?draftId=${draftId}`);
      return;
    }

    history.push('/projects/create');
  };

  const navigateToProjectPage = (id: number) => {
    history.push(`/projects/${id}`);
  };

  useEffect(() => {
    const getCodes = async () => {
      const codesResponse = await biohubApi.codes.getAllCodeSets();

      if (!codesResponse) {
        return;
      }

      setCodes(codesResponse);
    };

    if (!isLoadingCodes && !codes) {
      getCodes();
      setIsLoadingCodes(true);
    }
  }, [biohubApi.codes, isLoadingCodes, codes]);

  useEffect(() => {
    const getProjects = async () => {
      const projectsResponse = await biohubApi.project.getProjectsList();

      setProjects(() => {
        setIsLoading(false);
        return projectsResponse;
      });
    };

    const getDrafts = async () => {
      const draftsResponse = await biohubApi.draft.getDraftsList();

      setDrafts(() => {
        setIsLoading(false);
        return draftsResponse;
      });
    };

    if (isLoading) {
      getProjects();
      getDrafts();
    }
  }, [biohubApi, isLoading]);

  const showFilterErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  /**
   * Handle filtering project results.
   */
  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    try {
      const response = await biohubApi.project.getProjectsList(formikRef.current.values);

      if (!response) {
        return;
      }

      setProjects(() => {
        setIsLoading(false);
        return response;
      });
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Filtering Projects',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const handleReset = async () => {
    if (!formikRef?.current) {
      return;
    }

    formikRef.current.handleReset();

    setProjects(() => {
      setIsLoading(true);
      return [];
    });
  };

  const getProjectsTableData = () => {
    const hasProjects = projects?.length > 0;
    const hasDrafts = drafts?.length > 0;

    if (!hasProjects && !hasDrafts) {
      return (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Permits</TableCell>
              <TableCell>Coordinator Agency</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={6}>
                <Box display="flex" justifyContent="center">
                  No Results
                </Box>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      );
    } else {
      return (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Permits</TableCell>
                <TableCell>Coordinator Agency</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="project-table">
              {drafts?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      className={classes.linkButton}
                      variant="body2"
                      onClick={() => navigateToCreateProjectPage(row.id)}>
                      {row.name} (Draft)
                    </Link>
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              ))}
              {projects?.map((row) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => navigateToProjectPage(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.project_type}</TableCell>
                  <TableCell>{row.permits_list}</TableCell>
                  <TableCell>{row.coordinator_agency}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
  };

  /**
   * Displays project list.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Projects</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={() => navigateToCreateProjectPage()}>
            Create Project
          </Button>
        </Box>
        <Paper>
          <Box display="flex" alignItems="center" justifyContent="space-between" p={2}>
            <Typography variant="h4" component="h3">
              {projectCount} {projectCount !== 1 ? 'Projects' : 'Project'} found
            </Typography>
            {codes && (
              <Button
                variant="text"
                color="primary"
                startIcon={<Icon path={mdiFilterOutline} size={0.8} />}
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
                {!isFiltersOpen ? `Show Filters` : `Hide Filters`}
              </Button>
            )}
          </Box>
          <Divider></Divider>
          {isFiltersOpen && (
            <Box className={classes.filtersBox}>
              <Box px={2} py={4}>
                <Formik
                  innerRef={formikRef}
                  initialValues={ProjectAdvancedFiltersInitialValues}
                  onSubmit={handleSubmit}>
                  <ProjectAdvancedFilters
                    coordinator_agency={
                      codes?.coordinator_agency?.map((item: any) => {
                        return item.name;
                      }) || []
                    }
                    region={
                      codes?.region?.map((item) => {
                        return { value: item.name, label: item.name };
                      }) || []
                    }
                    species={
                      codes?.species?.map((item) => {
                        return { value: item.id, label: item.name };
                      }) || []
                    }
                    funding_sources={
                      codes?.funding_source?.map((item) => {
                        return { value: item.id, label: item.name };
                      }) || []
                    }
                  />
                </Formik>
                <Box mt={4} display="flex" alignItems="center" justifyContent="flex-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    className={classes.actionButton}>
                    Search
                  </Button>
                  <Button className={classes.actionButton} variant="outlined" color="primary" onClick={handleReset}>
                    Clear
                  </Button>
                </Box>
              </Box>
              <Divider></Divider>
            </Box>
          )}
          {getProjectsTableData()}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProjectsListPage;
