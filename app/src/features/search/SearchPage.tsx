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
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import SearchAdvancedFilters, {
  SearchAdvancedFiltersInitialValues
} from 'components/search-filter/SearchAdvancedFilters';
import { DATE_FORMAT } from 'constants/dateFormats';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetSearchResultsListResponse } from 'interfaces/useSearchApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

/**
 * Page to search for and display a list of records.
 *
 * @return {*}
 */
const SearchPage: React.FC = () => {
  const biohubApi = useBiohubApi();

  const [searchResults, setSearchResults] = useState<IGetSearchResultsListResponse[]>([]);
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

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    console.log(formikRef.current.values);

    try {
      const response = await biohubApi.search.getSearchResultsList(formikRef.current.values);

      if (!response) {
        return;
      }

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
  };

  const getSearchResultsTableData = () => {
    const hasSearchResults = searchResults?.length > 0;

    if (hasSearchResults) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Observation Name</TableCell>
                <TableCell>Project Name</TableCell>
                <TableCell>Region</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Funding Agency Name</TableCell>
                <TableCell>Funding Agency Project ID</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody data-testid="observation-table">
              {searchResults?.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell component="th" scope="row">
                    <Link
                      data-testid={row.name}
                      underline="always"
                      component="button"
                      variant="body2"
                      onClick={() => console.log(row.id)}>
                      {row.name}
                    </Link>
                  </TableCell>
                  <TableCell>{row.project_name}</TableCell>
                  <TableCell>{row.regions_list}</TableCell>
                  <TableCell>{row.species_list}</TableCell>
                  <TableCell>{row.funding_agency_name}</TableCell>
                  <TableCell>{row.funding_agency_project_id}</TableCell>
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
                />
              </Formik>
              <Box mt={2} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                  Search
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        {getSearchResultsTableData()}
      </Container>
    </Box>
  );
};

export default SearchPage;
