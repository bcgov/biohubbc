import { mdiClose, mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Collapse from '@mui/material/Collapse';
import { grey } from '@mui/material/colors';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useFormikContext } from 'formik';
import { IGetSurveyBlock } from 'interfaces/useSurveyApi.interface';
import { useContext, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import BlockStratumCard from '../../components/BlockStratumCard';
import { ICreateSamplingSiteRequest } from '../SamplingSitePage';

export const SamplingBlockForm = () => {
  const { setFieldValue, values } = useFormikContext<ICreateSamplingSiteRequest>();
  const surveyContext = useContext(SurveyContext);

  const options = surveyContext.surveyDataLoader?.data?.surveyData?.blocks || [];

  const [searchText, setSearchText] = useState('');

  const handleAddBlock = (block: IGetSurveyBlock) => {
    setFieldValue(`blocks[${values.blocks.length}]`, block);
  };

  const handleRemoveItem = (block: IGetSurveyBlock) => {
    setFieldValue(
      `blocks`,
      values.blocks.filter((existing) => existing.survey_block_id !== block.survey_block_id)
    );
  };

  return (
    <>
      <Typography component="legend">Assign to Block</Typography>
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
        id={'autocomplete-sample-block-form'}
        data-testid={'autocomplete-user-role-search'}
        filterSelectedOptions
        noOptionsText="No records found"
        options={options}
        filterOptions={(options, state) => {
          const searchFilter = createFilterOptions<IGetSurveyBlock>({ ignoreCase: true });
          const unselectedOptions = options.filter((item) =>
            values.blocks.every((existing) => existing.survey_block_id !== item.survey_block_id)
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
            handleAddBlock(option);
            setSearchText('');
          }
        }}
        onClose={() => {
          setSearchText('');
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder={'Select block'}
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
            <Box component="li" {...renderProps} key={renderOption?.survey_block_id}>
              <BlockStratumCard label={renderOption.name} description={renderOption.description || ''} />
            </Box>
          );
        }}
      />
      <TransitionGroup>
        {values.blocks.map((item, index) => {
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
                    <IconButton onClick={() => handleRemoveItem(item)} aria-label="settings">
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

export default SamplingBlockForm;
