import { Box, Typography } from '@material-ui/core';
import SearchActivitiesList from 'components/activities-list/SearchActivitiesList';
import { ISearchActivity } from 'features/home/search/SearchPage';
import React from 'react';

interface ISearchResultsList {
  classes?: any;
  totalItems: number;
  results?: ISearchActivity[];
}

const SearchResultsList: React.FC<ISearchResultsList> = (props) => {
  return (
    <Box>
      <Typography variant="h5">
        {(!props.totalItems && 'No Results Found') || `${props.totalItems} Matching Results Found`}
      </Typography>
      <SearchActivitiesList activities={props.results} />
    </Box>
  );
};

export default SearchResultsList;
