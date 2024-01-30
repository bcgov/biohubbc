import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { mdiTrashCanOutline } from '@mdi/js';
import { ICreateSamplingSiteRequest } from '../SamplingSitePage';
import { useContext } from 'react';
import { SurveyContext } from 'contexts/surveyContext';


const SamplingStratumForm = () => {

  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();

    const surveyContext = useContext(SurveyContext);

  const options: ISelectWithSubtextFieldOption[] | undefined = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums.map((stratum) => ({
      value: stratum.survey_stratum_id,
      label: stratum.name,
      subText: stratum.description || undefined
  }))

  const handleAddItem = () => {
    const newItem = {
      id: values.stratums.length,
      stratum: null,
    };

    setFieldValue('stratums', [...values.stratums, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = values.stratums.filter((_: any, i: number) => i !== index);
    setFieldValue('stratums', updatedItems);
  };

  const determineOptions = (options: ISelectWithSubtextFieldOption[]) => options.filter((option) => {
    return !values.stratums.some((value) => value.survey_stratum_id === option.value)
  })


  return ( options ?
    <>
      <Typography component="legend">Add Sampling Site Groups</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 3,
          maxWidth: '92ch',
        }}
      >All sampling sites being imported together will be assigned to the selected sampling site groups</Typography>
      <FieldArray
        name={'stratums'}
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <Box sx={{ mb: 3, maxWidth: '92ch' }}>
              <List dense disablePadding>
                {values.stratums.map((item: any, index: number) => (
                  <ListItem disableGutters key={index}>
                    <ListItemText>
                      <SelectWithSubtextField
                        id={`sampling-site-stratum-${index}`}
                        label='Sampling Site Group'
                        name={`${'stratums'}.${index}.stratum`}
                        options={determineOptions(options)}
                      />
                    </ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton
                        data-testid={`delete-icon-${index}`}
                        aria-label={`remove group`}
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Icon path={mdiTrashCanOutline} size={1} />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
              <Box>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  aria-label={`add group`}
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={handleAddItem}
                >
                  Add Group
                </Button>
              </Box>
            </Box>
          </>
        )}
      />
    </> : null
  );
};

export default SamplingStratumForm;
