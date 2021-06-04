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

  const [showSearchFields, setShowSearchFields] = useState(true);
  const [searchResults, setSearchResults] = useState<IGetSearchResultsListResponse[]>([]);
  const [surveyOccurrences, setSurveyOccurrences] = useState<Feature[]>([]);
  const [bounds, setBounds] = useState<any[]>([]);
  const [selectedSurveyName, setSelectedSurveyName] = useState('');
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

  const handleReset = () => {
    if (!formikRef?.current) {
      return;
    }

    formikRef.current.handleReset();

    setSearchResults([]);
    getSearchResults(formikRef.current.values);
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

      if (!response || !response.length) {
        return;
      }

      setShowSearchFields(false);

      setSearchResults(() => {
        return response;
      });
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Searching For Results',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }

    // setShowSearchFields(false);

    // const mockResponse = [{
    //   id: 1,
    //   project_name: 'Project Tima',
    //   regions: ['Region 1', 'Region 2'],
    //   funding_agency_name: 'Agency Name',
    //   funding_agency_project_id: '123',
    //   coordinator_agency_name: 'Coordinator Agency',
    //   surveys: [{ id: 1, name: 'Survey 1' }, { id: 2, name: 'Survey 2' }],
    //   start_date: '2020/04/04',
    //   end_date: '2020/05/05'
    // }];

    // setSearchResults(mockResponse);
  };

  const getSurveyOccurrenceData = async (survey: any) => {
    setSurveyOccurrences([]);
    setSelectedSurveyName(survey.name);

    try {
      const response = await biohubApi.search.getSurveyOccurrences(survey.id);

      if (!response || !response.geometry || !response.geometry.length) {
        return;
      }

      const { geometryCollection, bounds } = generateValidGeometryCollection(response.geometry);

      setSurveyOccurrences(geometryCollection);
      setBounds(bounds);
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Getting Survey Occurrences Data',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const getSearchResultsTableData = () => {
    const hasSearchResults = searchResults?.length > 0;

    if (!hasSearchResults) {
      return (
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
      );
    } else {
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
                  <TableCell>{row.funding_agency_name}</TableCell>
                  <TableCell>{row.funding_agency_project_id}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.start_date)}</TableCell>
                  <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateFormat, row.end_date)}</TableCell>
                  <TableCell>
                    {row.surveys.map((survey: any, index: number) => (
                      <Fragment key={index}>
                        {index !== row.surveys.length - 1 && (
                          <>
                            <Link
                              underline="always"
                              component="button"
                              variant="body2"
                              onClick={() => getSurveyOccurrenceData(survey)}>
                              {survey.name}
                            </Link>
                            <br />
                          </>
                        )}
                        {index === row.surveys.length - 1 && (
                          <Link
                            underline="always"
                            component="button"
                            variant="body2"
                            onClick={() => getSurveyOccurrenceData(survey)}>
                            {survey.name}
                          </Link>
                        )}
                      </Fragment>
                    ))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
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
          {codes && showSearchFields && (
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
                {searchResults?.length > 0 && (
                  <Button
                    className={classes.actionButton}
                    variant="outlined"
                    color="primary"
                    onClick={() => setShowSearchFields(false)}>
                    Hide Advanced Filters
                  </Button>
                )}
                <Button className={classes.actionButton} variant="outlined" color="primary" onClick={handleReset}>
                  Reset Fields
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
          {!showSearchFields && (
            <Box mb={4}>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button
                  className={classes.actionButton}
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowSearchFields(true)}>
                  Show Advanced Filters
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        {getSearchResultsTableData()}
        {selectedSurveyName && (
          <>
            <Box mt={6}>
              <Typography variant="h2">Survey Occurrences</Typography>
            </Box>
            <Box mt={2}>
              <Typography>{selectedSurveyName}</Typography>
            </Box>
            {surveyOccurrences.length > 0 && (
              <Box mt={4} height={500}>
                <MapContainer
                  mapId="survey_occurrences_map"
                  hideDrawControls={true}
                  hideOverlayLayers={true}
                  nonEditableGeometries={surveyOccurrences}
                  bounds={bounds}
                />
              </Box>
            )}
            {surveyOccurrences.length === 0 && (
              <Box mt={4} height={500}>
                <Typography>No Occurrence Data</Typography>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default SearchPage;
