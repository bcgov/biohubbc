import { mdiClose, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { Card, CardHeader, Collapse, IconButton, Typography } from '@mui/material';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import TextField from '@mui/material/TextField';
import { SurveyContext } from 'contexts/surveyContext';
import { useFormikContext } from 'formik';
import { IGetSampleStratumDetails, IGetSurveyStratum } from 'interfaces/useSurveyApi.interface';
import { default as React, useContext, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import BlockStratumCard from './BlockStratumCard';
import { IEditSamplingSiteRequest } from './SampleSiteEditForm';

const SamplingStratumEditForm = () => {
  const { values, setFieldValue } = useFormikContext<IEditSamplingSiteRequest>();
  const surveyContext = useContext(SurveyContext);

  const options = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums || [];

  const [searchText, setSearchText] = useState('');

  const handleAddStratum = (stratum: IGetSurveyStratum) => {
    setFieldValue(`sampleSite.stratums[${values.sampleSite.stratums.length}]`, stratum);
  };
  const handleRemoveItem = (stratum: IGetSurveyStratum | IGetSampleStratumDetails) => {
    setFieldValue(
      `sampleSite.stratums`,
      values.sampleSite.stratums.filter((existing) => existing.survey_stratum_id !== stratum.survey_stratum_id)
    );
  };

  return (
    <>
      <Typography component="legend">Assign to Stratum</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 3,
          maxWidth: '92ch'
        }}>
        All sampling sites being imported together will be assigned to the selected groups
      </Typography>
      <Autocomplete
        id={'autocomplete-sample-stratum-form'}
        data-testid={'autocomplete-user-role-search'}
        filterSelectedOptions
        noOptionsText="No records found"
        options={options}
        filterOptions={(options, state) => {
          const searchFilter = createFilterOptions<IGetSurveyStratum>({ ignoreCase: true });
          const unselectedOptions = options.filter((item) =>
            values.sampleSite.stratums.every((existing) => existing.survey_stratum_id !== item.survey_stratum_id)
          );
          return searchFilter(unselectedOptions, state);
        }}
        getOptionLabel={(option) => option.name}
        selectOnFocus
        clearOnEscape
        inputValue={searchText}
        clearOnBlur={false}
        value={null}
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
            setSearchText('');
          }
        }}
        onClose={(value, reason) => {
          setSearchText('');
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
              <BlockStratumCard label={renderOption.name} description={renderOption.description || ''} />
            </Box>
          );
        }}
      />
      <TransitionGroup>
        {values.sampleSite.stratums.map((item, index) => {
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
                      onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => handleRemoveItem(item)}
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

export default SamplingStratumEditForm;