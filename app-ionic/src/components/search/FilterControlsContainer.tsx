import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  Grid,
  TextField
} from '@material-ui/core';
import React from 'react';

export interface ISearchFilterCriteria {
  startDate?: string;
  endDate?: string;
  activityType?: string[];
  speciesType?: string[];
  habitatType?: string[];
}

interface IFilterControlsContainer {
  classes?: any;
  isDisabled?: boolean;
  searchFilterCriteriaState: {
    searchFilterCriteria: ISearchFilterCriteria;
    setSearchFilterCriteria: (searchFilterCriteria: ISearchFilterCriteria) => void;
  };
}

const FilterControlsContainer: React.FC<IFilterControlsContainer> = (props) => {
  /**
   * Handles changes to a filter that is an array of strings.
   *
   * @param {string} filterName name of the filter parameter
   * @param {string} value value to add or remove from the filter array
   * @param {boolean} checked true if the value should be added, false if it should be removed
   */
  const handleStringArrayFilterChange = (filterName: string, value: string, checked: boolean) => {
    const index = props.searchFilterCriteriaState.searchFilterCriteria.activityType.indexOf(value);

    let newSearchFilterCriteria = { ...props.searchFilterCriteriaState.searchFilterCriteria };

    if (checked && index === -1) {
      // add the value to the array
      newSearchFilterCriteria[filterName].push(value);
    } else if (!checked && index >= 0) {
      // remove the value from the array
      newSearchFilterCriteria[filterName].splice(index, 1);
    }

    props.searchFilterCriteriaState.setSearchFilterCriteria(newSearchFilterCriteria);
  };

  /**
   * Handles changes to a filter that is a single string.
   *
   * @param {string} filterName name of the filter parameter
   * @param {string} value value to set the filter to
   */
  const handleStringFilterChange = (filterName: string, value: string) => {
    const newSearchFilterCriteria = { ...props.searchFilterCriteriaState.searchFilterCriteria, [filterName]: value };

    props.searchFilterCriteriaState.setSearchFilterCriteria(newSearchFilterCriteria);
  };

  if (!props.searchFilterCriteriaState.searchFilterCriteria) {
    return <></>;
  }

  return (
    <>
      <fieldset className={props.classes.fieldset}>
        <Grid container spacing={4}>
          <Grid item>
            <FormControl>
              <FormLabel component="legend">Date Range</FormLabel>
              <FormGroup row={true}>
                <Box mr={3}>
                  <TextField
                    id="datepicker_start"
                    name="datepicker_start"
                    label="Start"
                    type="date"
                    value={props.searchFilterCriteriaState.searchFilterCriteria.startDate}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true
                    }}
                    disabled={props.isDisabled}
                    onChange={(event) => handleStringFilterChange('startDate', event.target.value)}
                  />
                </Box>
                <Box>
                  <TextField
                    id="datepicker_end"
                    name="datepicker_end"
                    label="End"
                    type="date"
                    value={props.searchFilterCriteriaState.searchFilterCriteria.endDate}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true
                    }}
                    disabled={props.isDisabled}
                    onChange={(event) => handleStringFilterChange('endDate', event.target.value)}
                  />
                </Box>
              </FormGroup>
            </FormControl>
          </Grid>
        </Grid>
      </fieldset>
      <fieldset className={props.classes.fieldset}>
        <Grid container spacing={4}>
          <Grid item>
            <FormControl component="fieldset" disabled={props.isDisabled}>
              <FormLabel component="legend">Activity Type</FormLabel>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkbox_observation"
                      checked={props.searchFilterCriteriaState.searchFilterCriteria.activityType.includes(
                        'Observation'
                      )}
                      onChange={(event) =>
                        handleStringArrayFilterChange('activityType', 'Observation', event.target.checked)
                      }
                    />
                  }
                  label="Observation"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkbox_treatment"
                      checked={props.searchFilterCriteriaState.searchFilterCriteria.activityType.includes('Treatment')}
                      onChange={(event) =>
                        handleStringArrayFilterChange('activityType', 'Treatment', event.target.checked)
                      }
                    />
                  }
                  label="Treatment"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="checkbox_monitoring"
                      checked={props.searchFilterCriteriaState.searchFilterCriteria.activityType.includes('Monitoring')}
                      onChange={(event) =>
                        handleStringArrayFilterChange('activityType', 'Monitoring', event.target.checked)
                      }
                    />
                  }
                  label="Monitoring"
                />
              </FormGroup>
              <FormHelperText>Selecting none searches all</FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
      </fieldset>
    </>
  );
};

export default FilterControlsContainer;
