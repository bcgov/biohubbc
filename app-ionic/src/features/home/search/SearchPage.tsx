import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  makeStyles,
  Paper,
  Theme,
  Typography
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FilterControlsContainer, { ISearchFilterCriteria } from 'components/search/FilterControlsContainer';
import PaginationControlsContainer from 'components/search/PaginationControlsContainer';
import { calculateTotalPages } from 'components/search/paginationUtils';
import SearchResultsList from 'components/search/SearchResultsList';
import { useBiohubApi } from 'hooks/useBiohubApi';
import { useQuery } from 'hooks/useQuery';
import { IActivitySearchCriteria, SORT_DIRECTION } from 'interfaces/useBiohubApi-interfaces';
import moment from 'moment';
import qs from 'qs';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

const useStyles = makeStyles((theme: Theme) => ({
  fieldset: {
    border: 'none',
    marginBottom: '1rem'
  }
}));

export interface ISearchActivity {
  _id: string;
  activityType: string;
  activitySubtype: string;
  dateReceived: string;
}

export interface ISearchPagePage {
  classes?: any;
}

const SearchPage: React.FC<ISearchPagePage> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const queryParams = useQuery();

  const biohubApi = useBiohubApi();

  const [searchFilterCriteria, setSearchFilterCriteria] = useState<ISearchFilterCriteria>({
    startDate: queryParams.startDate || '',
    endDate: queryParams.endDate || '',
    activityType: queryParams.activityType || [],
    speciesType: queryParams.speciesType || [],
    habitatType: queryParams.habitatType || []
  });

  const [currentPage, setCurrentPage] = useState(Number(queryParams.currentPage) || 1);
  const [itemsPerPage, setItemsPerPage] = useState(Number(queryParams.itemsPerPage) || 25);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState(queryParams.sortBy || '-received_timestamp');

  const [searchResults, setSearchResults] = useState<ISearchActivity[]>([]);

  const [isDisabled, setIsDisabled] = useState(false);

  const sortByValues = {
    // Note: prefixed with `+` or `-` to represent `ASC` or `DESC` respectively
    '-received_timestamp': 'Date (newest at top)',
    '+activity_type': 'Type (a-z)',
    '+activity_subtype': 'Subtype (a-z)'
  };

  /**
   * Call the API to fetch records based on the current filter criteria and pagination settings.
   */
  const handleSearch = async () => {
    setIsDisabled(true);

    // Save the `searchFilterCriteria` to the url
    history.push({ search: qs.stringify({ ...queryParams, ...searchFilterCriteria }) });

    const startDate = moment(searchFilterCriteria.startDate, 'YYYY-MM-DD');
    const startDateFilter: object =
      (startDate && startDate.isValid() && { date_range_start: startDate.startOf('day').toISOString() }) || {};

    const endDate = moment(searchFilterCriteria.endDate, 'YYYY-MM-DD');
    const endDateFilter: object =
      (endDate && endDate.isValid() && { date_range_end: endDate.endOf('day').toISOString() }) || {};

    const activityTypeFilter: object =
      (searchFilterCriteria.activityType &&
        searchFilterCriteria.activityType.length && { activity_type: searchFilterCriteria.activityType }) ||
      {};

    const sortColumn = sortBy.substring(1);
    const sortDirection = sortBy.substring(0, 1);

    const activitySearchCriteria: IActivitySearchCriteria = {
      page: currentPage - 1, // The api starts at page 0, while the UI starts at page 1.
      limit: itemsPerPage,
      sort_by: sortColumn,
      sort_direction: (sortDirection === '-' && SORT_DIRECTION.DESC) || SORT_DIRECTION.ASC,
      column_names: ['activity_id', 'activity_type', 'activity_subtype', 'created_timestamp', 'received_timestamp'],
      ...startDateFilter,
      ...endDateFilter,
      ...activityTypeFilter // NICK TODO WIP - Update backend search to accept array of type, etc. Move it all into the URL????
    };

    try {
      const response = await biohubApi.getActivities(activitySearchCriteria); // NICK TODO WIP - Need a simpler api that just fetches basic information as well as counts, and not photos, etc.

      if (!response || !response.rows) {
        // TODO error messaging
      }

      const activities = response.rows.map((activity) => {
        return {
          _id: activity.activity_id,
          activityId: activity.activity_id,
          activityType: activity.activity_type,
          activitySubtype: activity.activity_subtype,
          dateCreated: activity.created_timestamp,
          dateReceived: activity.received_timestamp
        };
      });

      const count = Number(response.count);

      setSearchResults(activities);
      setTotalItems(count);
      setTotalPages(calculateTotalPages(count, itemsPerPage));
    } catch {
      // TODO error messaging
    }

    setIsDisabled(false);
  };

  useEffect(() => {
    // Save the new `itemsPerPage` to the url
    history.push({ search: qs.stringify({ ...queryParams, itemsPerPage: itemsPerPage }) });

    if (currentPage !== 1) {
      // The current page needs to be reset on `itemsPerPage` change
      // In this case, do not trigger the search, as the useEffect on [currentPage] will trigger the search
      setCurrentPage(1);
      return;
    }

    handleSearch();
  }, [itemsPerPage]);

  useEffect(() => {
    // Save the new `currentPage` to the url
    history.push({ search: qs.stringify({ ...queryParams, currentPage: currentPage }) });

    handleSearch();
  }, [currentPage]);

  useEffect(() => {
    // Save the new `sortBy` to the url
    history.push({ search: qs.stringify({ ...queryParams, sortBy: sortBy }) });

    handleSearch();
  }, [sortBy]);

  return (
    <Container className={props.classes.container}>
      <Box mb={3}>
        <Typography variant="h4">Search biohubbc Records</Typography>
      </Box>
      <Box mb={2}>
        <form className={props.classes.form}>
          <Accordion defaultExpanded={true}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls="search-filter-controls"
              id="search-filter-controls">
              <Typography variant="h5">Filters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box flexDirection="column">
                <Box>
                  <FilterControlsContainer
                    classes={classes}
                    searchFilterCriteriaState={{ searchFilterCriteria, setSearchFilterCriteria }}
                    isDisabled={isDisabled}
                  />
                </Box>
                <Box p={2}>
                  <Button variant="contained" color="primary" onClick={handleSearch} disabled={isDisabled}>
                    Search
                  </Button>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </form>
      </Box>
      <Paper>
        <Box p={2}>
          <Box>
            <PaginationControlsContainer
              classes={classes}
              currentPageState={{ currentPage, setCurrentPage }}
              itemsPerPageState={{ itemsPerPage, setItemsPerPage }}
              totalItems={totalItems}
              totalPages={totalPages}
              sortByValues={sortByValues}
              sortByState={{ sortBy, setSortBy }}
              isDisabled={isDisabled}
            />
          </Box>
          <Box>
            <SearchResultsList classes={classes} totalItems={totalItems} results={searchResults} />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default SearchPage;
