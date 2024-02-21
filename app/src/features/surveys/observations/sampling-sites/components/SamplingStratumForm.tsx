import { mdiClose, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, Collapse, IconButton, Typography } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import { SurveyContext } from 'contexts/surveyContext';
import { IStratum } from 'features/surveys/components/SurveySiteSelectionForm';
import { useFormikContext } from 'formik';
import { default as React, useContext, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { ICreateSamplingSiteRequest } from '../SamplingSitePage';

const SamplingStratumForm: React.FC = () => {
  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

  const surveyContext = useContext(SurveyContext);

  const options = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums || [];
  const [selectedStratums, setSelectedStratums] = useState<IStratum[]>([]);

  interface IStratumCard {
    label: string;
    description: string;
  }

  const StratumCard: React.FC<IStratumCard> = (props) => (
    <Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {props.label}
        </Typography>
      </Box>
      <Box my={0.25}>
        <Typography variant="subtitle2" color="textSecondary">
          {props.description}
        </Typography>
      </Box>
    </Box>
  );

  const [searchText, setSearchText] = useState('');

  const handleAddStratum = (stratum: IStratum) => {
    selectedStratums.push(stratum);
    setFieldValue(`stratums[${selectedStratums.length - 1}]`, stratum);
  };

  const handleRemoveItem = (stratum: IStratum, index: number) => {
    const filteredStratums = selectedStratums.filter(
      (existing) => existing.survey_stratum_id !== stratum.survey_stratum_id
    );
    setSelectedStratums(filteredStratums);
    setFieldValue(`stratums`, filteredStratums);
  };

  return (
    <>
      <Typography component="legend">Assign to Strata</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 3,
          maxWidth: '92ch'
        }}>
        All sampling sites being imported together will be assigned to the selected strata
      </Typography>
      <Autocomplete
        id={'autocomplete-sample-stratum-form'}
        data-testid={'autocomplete-user-role-search'}
        filterSelectedOptions
        noOptionsText="No records found"
        value={null}
        options={options}
        filterOptions={(options, state) => {
          const searchFilter = createFilterOptions<IStratum>({ ignoreCase: true });
          const unselectedOptions = options.filter(
            (item) => !selectedStratums.some((existing) => existing.survey_stratum_id === item.survey_stratum_id)
          );
          return searchFilter(unselectedOptions, state);
        }}
        getOptionLabel={(option) => option.name}
        inputValue={searchText}
        onInputChange={(_, value, reason) => {
          if (reason === 'reset') {
            setSearchText('');
          } else {
            setSearchText(value);
          }
        }}
        onChange={(_, option) => {
          if (option) {
            handleAddStratum(option);
          }
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={'Select stratum'}
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <Box mx={1} mt="6px">
                  <Icon path={mdiMagnify} size={1}></Icon>
                </Box>
              )
            }}
          />
        )}
        renderOption={(renderProps, renderOption) => {
          return (
            <Box component="li" {...renderProps} key={renderOption?.survey_stratum_id}>
              <StratumCard label={renderOption.name} description={renderOption.description || ''} />
            </Box>
          );
        }}
      />
      <TransitionGroup>
        {values.stratums?.map((item, index) => {
          return (
            <Collapse key={`${item.name}-${item.description}-${index}`}>
              <Card
                variant="outlined"
                sx={{
                  background: grey[100],
                  '& .MuiCardHeader-subheader': {
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    maxWidth: '92ch',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontSize: '14px'
                  },
                  mt: 1,
                  '& .MuiCardHeader-title': {
                    mb: 0.5
                  }
                }}>
                <CardHeader
                  action={
                    <IconButton
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
                        handleRemoveItem(item, index)
                      }
                      aria-label="settings">
                      <Icon path={mdiClose} size={1} />
                    </IconButton>
                  }
                  title={item.name}
                  subheader={item.description}
                />
              </Card>
            </Collapse>
          );
        })}
      </TransitionGroup>
    </>
  );
};

export default SamplingStratumForm;
