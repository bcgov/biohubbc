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
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ObservationAdvancedFilters, {
  ObservationAdvancedFiltersInitialValues
} from 'components/search-filter/ObservationAdvancedFilters';
import { DATE_FORMAT } from 'constants/dateFormats';
import { DialogContext } from 'contexts/dialogContext';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import { IGetObservationsListResponse } from 'interfaces/useObservationApi.interface';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
});

/**
 * Page to search for and display a list of observation records.
 *
 * @return {*}
 */
const ObservationsSearchPage: React.FC = () => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [observations, setObservations] = useState<IGetObservationsListResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
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

  useEffect(() => {
    const getObservations = async () => {
      const observationsResponse = await biohubApi.observation.getObservationsList();

      setObservations(() => {
        setIsLoading(false);
        return observationsResponse;
      });
    };

    if (isLoading) {
      getObservations();
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

  const handleSubmit = async () => {
    if (!formikRef?.current) {
      return;
    }

    console.log(formikRef.current.values);

    try {
      const response = await biohubApi.observation.getObservationsList(formikRef.current.values);

      if (!response) {
        return;
      }

      setObservations(() => {
        setIsLoading(false);
        return response;
      });
    } catch (error) {
      const apiError = error as APIError;
      showFilterErrorDialog({
        dialogTitle: 'Error Filtering Observations',
        dialogError: apiError?.message,
        dialogErrorDetails: apiError?.errors
      });
    }
  };

  const getObservationsTableData = () => {
    const hasObservations = observations?.length > 0;

    if (!hasObservations) {
      return (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow></TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>No Observations found</TableCell>
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
              {observations?.map((row: any) => (
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
   * Displays observations list and search filters.
   */
  return (
    <Box my={4}>
      <Container maxWidth="xl">
        <Box mb={5} display="flex" justifyContent="space-between">
          <Typography variant="h1">Observations Search</Typography>
          {codes && (
            <Button
              className={classes.actionButton}
              variant="outlined"
              color="primary"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}>
              {!isFiltersOpen ? `Open Advanced Filters` : `Close Advanced Filters`}
            </Button>
          )}
        </Box>
        {isFiltersOpen && (
          <Box mb={4}>
            <Formik
              innerRef={formikRef}
              initialValues={ObservationAdvancedFiltersInitialValues}
              onSubmit={handleSubmit}>
              <ObservationAdvancedFilters
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
        {getObservationsTableData()}
      </Container>
    </Box>
  );
};

export default ObservationsSearchPage;
