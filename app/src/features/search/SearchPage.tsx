import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/styles/makeStyles';
import MapContainer from 'components/map/MapContainer';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import SearchAdvancedFilters, {
  ISearchAdvancedFilters,
  SearchAdvancedFiltersInitialValues
} from 'components/search-filter/SearchAdvancedFilters';
import { DATE_FORMAT } from 'constants/dateFormats';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { Feature } from 'geojson';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetSearchResultsListResponse } from 'interfaces/useSearchApi.interface';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';
import { generateValidGeometryCollection } from 'utils/mapBoundaryUploadHelpers';
import Dialog from '@material-ui/core/Dialog';
import Header from 'components/layout/Header';

const useStyles = makeStyles({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
});

/**
 * Page to search for and display a list of records.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const biohubApi = useBiohubApi();
  const classes = useStyles();

  const [searchResults, setSearchResults] = useState<IGetSearchResultsListResponse[]>([]);
  const [projectGeometries, setProjectGeometries] = useState<Feature[]>([]);
  // const [bounds, setBounds] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [formikRef] = useState(useRef<FormikProps<any>>(null));
  const [codes, setCodes] = useState<IGetAllCodeSetsResponse>();
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);

  const dialogContext = useContext(DialogContext);

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

  const handleReset = async () => {
    if (!formikRef?.current) {
      return;
    }

    formikRef.current.handleReset();

    setSearchResults([]);
    await getSearchResults(formikRef.current.values);
  };

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    getSearchResults(formikRef.current.values);
  };

  const getSearchResults = async (values: ISearchAdvancedFilters) => {
    try {
      const response = await biohubApi.search.getSearchResultsList(values);

      if (!response) {
        return;
      }

      if (!response.length) {
        setSearchResults([]);
        return;
      }

      setShowSearchResults(true);

      setSearchResults(() => {
        return response;
      });

      let projectGeos: any[] = [];

      response.forEach((project: any) => {
        projectGeos.push(generateValidGeometryCollection(project.project_geometry).geometryCollection);
      });

      setProjectGeometries(projectGeos);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const getSearchResultsTableData = () => {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Coordinator Agency</TableCell>
              <TableCell>Regions</TableCell>
              <TableCell>Funding Agency Name</TableCell>
              <TableCell>Funding Agency Project ID</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Surveys</TableCell>
            </TableRow>
          </TableHead>
          <TableBody data-testid="observation-table">
            {searchResults?.map((row: any) => (
              <TableRow key={row.id}>
                <TableCell>{row.project_name}</TableCell>
                <TableCell>{row.coordinator_agency_name}</TableCell>
                <TableCell>{row.regions.join(', ')}</TableCell>
                <TableCell>{row.funding_agency_name.join(', ')}</TableCell>
                <TableCell>{row.funding_agency_project_id.join(', ')}</TableCell>
                <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                <TableCell>
                  {row.surveys.map((survey: any, index: number) => (
                    <Fragment key={index}>
                      {survey && (
                        <Link
                          underline="always"
                          component="button"
                          variant="body2"
                          onClick={() => {
                            // getSurveyOccurrenceData(
                            //   parseInt(survey.substring(survey.indexOf(':') + 1, survey.lastIndexOf(','))),
                            //   survey.split(':').pop().split(',')[0]
                            // );
                            console.log('je')
                          }}>
                          {survey.split(':').pop().split(',')[0]}
                        </Link>
                      )}
                      {index !== row.surveys.length - 1 && <br />}
                    </Fragment>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  /**
   * Displays search results list and filters.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Search</Typography>
        </Box>
        <Box>
          {codes && (
            <Box mb={4}>
              <Formik innerRef={formikRef} initialValues={SearchAdvancedFiltersInitialValues} onSubmit={handleSubmit}>
                <SearchAdvancedFilters
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
                  coordinator_agency={
                    codes?.coordinator_agency?.map((item: any) => {
                      return item.name;
                    }) || []
                  }
                />
              </Formik>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button className={classes.actionButton} variant="outlined" color="primary" onClick={handleReset}>
                  Reset
                </Button>
                <Button
                  className={classes.actionButton}
                  type="submit"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}>
                  Search
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        {searchResults.length === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow></TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>No Search Results Found</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        )}
        <Dialog open={showSearchResults} fullScreen={true}>
          <Header />
          <Box my={4}>
            <Container maxWidth="xl">
              <Box mb={5} display="flex" justifyContent="space-between">
                <Typography variant="h1">Search Results</Typography>
                <Button
                  className={classes.actionButton}
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowSearchResults(false)}>
                  Return to Search
                </Button>
              </Box>
              {getSearchResultsTableData()}
              <Box mt={4} height={500}>
                <MapContainer
                  mapId="search_results_map"
                  hideDrawControls={true}
                  hideOverlayLayers={true}
                  nonEditableGeometries={[...projectGeometries]}
                  // bounds={bounds}
                />
              </Box>
            </Container>
          </Box>
        </Dialog>
      </Container>
    </Box>
  );
};

export default SearchPage;
