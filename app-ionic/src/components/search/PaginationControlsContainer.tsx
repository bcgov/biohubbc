import { FormControl, FormLabel, Grid, Select } from '@material-ui/core';
import { Pagination, ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { calculatePaginationLabel } from 'components/search/paginationUtils';
import React from 'react';

export interface IPaginationControlsContainer {
  classes?: any;
  currentPageState: { currentPage: number; setCurrentPage: (currentPage: number) => void };
  itemsPerPageState: { itemsPerPage: number; setItemsPerPage: (itemsPerPage: number) => void };
  totalItems: number;
  totalPages: number;
  sortByValues: { [key: string]: string };
  sortByState: { sortBy: string; setSortBy: (sortBy: string) => void };
  isDisabled?: boolean;
}

const PaginationControlsContainer: React.FC<IPaginationControlsContainer> = (props) => {
  const handleLimitChange = (value: number) => {
    if (!value) {
      return;
    }

    props.itemsPerPageState.setItemsPerPage(value);
  };

  const handlePaginationChange = (value: number) => {
    if (!value) {
      return;
    }

    props.currentPageState.setCurrentPage(value);
  };

  const handleSortByChange = (value: string) => {
    if (!value) {
      return;
    }

    props.sortByState.setSortBy(value);
  };

  if (!props.currentPageState.currentPage || !props.itemsPerPageState.itemsPerPage) {
    return <></>;
  }

  return (
    <fieldset className={props.classes.fieldset}>
      <Grid container spacing={4} justify={'space-between'}>
        <Grid item>
          <FormControl component="fieldset" className={props.classes.formControl} disabled={props.isDisabled}>
            <FormLabel component="legend" className={props.classes.formLabel}>
              # of results to display
            </FormLabel>
            <ToggleButtonGroup
              exclusive
              value={props.itemsPerPageState.itemsPerPage}
              onChange={(event: any, value: number) => handleLimitChange(value)}
              aria-label="# of results to display">
              <ToggleButton value={10} disabled={props.isDisabled}>
                10
              </ToggleButton>
              <ToggleButton value={25} disabled={props.isDisabled}>
                25
              </ToggleButton>
              <ToggleButton value={50} disabled={props.isDisabled}>
                50
              </ToggleButton>
              <ToggleButton value={100} disabled={props.isDisabled}>
                100
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl className={props.classes.formControl} disabled={props.isDisabled}>
            <FormLabel component="legend" className={props.classes.formLabel}>
              Sort By
            </FormLabel>
            <Select
              native
              value={props.sortByState.sortBy}
              onChange={(event: any) => handleSortByChange(event.target.value)}
              inputProps={{
                name: 'sortBy',
                id: 'sortBy'
              }}>
              {Object.entries(props.sortByValues).map((entry) => (
                <option value={entry[0]} key={entry[0]}>
                  {entry[1]}
                </option>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item>
          <FormControl component="fieldset" className={props.classes.formControl} disabled={props.isDisabled}>
            <FormLabel component="legend" className={props.classes.formLabel}>
              {calculatePaginationLabel(
                props.currentPageState.currentPage,
                props.itemsPerPageState.itemsPerPage,
                props.totalItems
              )}
            </FormLabel>
            <Pagination
              count={props.totalPages}
              defaultPage={1}
              page={props.currentPageState.currentPage}
              showFirstButton={true}
              showLastButton={true}
              disabled={props.isDisabled}
              onChange={(event: any, value: number) => handlePaginationChange(value)}
            />
          </FormControl>
        </Grid>
      </Grid>
    </fieldset>
  );
};

export default PaginationControlsContainer;
