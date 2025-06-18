import { mdiCheckBold, mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Button, Collapse, IconButton, Stack, Typography } from '@mui/material';
import { FieldArray, useFormikContext } from 'formik';
import { useCallback, useState } from 'react';
import { TransitionGroup } from 'react-transition-group';

import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import { FreeSoloAutocompleteField } from 'components/fields/FreeSoloAutocomplete';
import { ISubmitSurvey } from 'components/publish/PublishSurveyDialog';
import { IPublishSurveyTag } from 'interfaces/usePublishApi.interface';
import { v4 } from 'uuid';

interface IPublishSurveyTagsContainerProps {
  options: IAutocompleteFieldOption<string>[];
}

export const PublishSurveyTagsContainer = ({ options }: IPublishSurveyTagsContainerProps) => {
  const { values, setFieldValue } = useFormikContext<ISubmitSurvey>();
  const [newTags, setNewTags] = useState<IPublishSurveyTag[]>([]);
  const [inputValues, setInputValues] = useState<string[]>([]); // store input values for new tags

  const handleRemove = useCallback(
    (index: number) => {
      // Clear the Formik field value for this index
      setFieldValue(`new-tag-${index}`, '');

      setNewTags((prev) => prev.filter((_, i) => i !== index));
      setInputValues((prev) => prev.filter((_, i) => i !== index));
    },
    [setFieldValue]
  );

  const handleSave = useCallback(
    (index: number) => {
      const inputName = inputValues[index]?.trim();
      if (!inputName) {
        return;
      }

      const isDuplicate = values.tags.some((tag) => tag.name.toLowerCase() === inputName.toLowerCase());
      if (!isDuplicate) {
        setFieldValue('tags', [...values.tags, { name: inputName }]);
      }
      handleRemove(index);
    },
    [inputValues, values.tags, setFieldValue, handleRemove]
  );

  // And update your handleCreateNewTag to ensure clean state
  const handleCreateNewTag = () => {
    const newIndex = newTags.length;
    setNewTags((prev) => [...prev, { _id: v4(), name: '' }]);
    setInputValues((prev) => [...prev, '']);
    // Ensure the Formik field starts clean
    setFieldValue(`new-tag-${newIndex}`, '');
  };

  return (
    <FieldArray name="tags">
      {({ push, remove }) => (
        <>
          <Typography component="legend" fontWeight="bold">
            Tags
          </Typography>
          <Typography color="textSecondary" mb={2}>
            Add tags to help organize your published data. Surveys with the same tags will be grouped together.
          </Typography>

          <Box mt={1}>
            <TransitionGroup>
              {values.tags?.map((tag, index) => (
                <Collapse key={`tag-${tag.name}-${index}`}>
                  <NameDescriptionCard label={tag.name} onDelete={() => remove(index)} sx={{ my: 0.5 }} />
                </Collapse>
              ))}

              {newTags.map((tag, index) => (
                <Collapse key={tag._id}>
                  <FreeSoloAutocompleteField
                    sx={{ my: 1 }}
                    label="Tag"
                    id={`new-tag-${index}`}
                    name={`new-tag-${index}`}
                    clearOnBlur
                    clearOnEscape
                    value={''}
                    showValue
                    options={options}
                    onInputChange={(_, newInput) => {
                      setInputValues((prev) => {
                        const updated = [...prev];
                        updated[index] = newInput;
                        return updated;
                      });
                    }}
                    endIcon={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton
                          sx={{ border: '1px solid', borderRadius: 1 }}
                          color="success"
                          onClick={() => handleSave(index)}
                          aria-label="Save tag">
                          <Icon path={mdiCheckBold} size={1} />
                        </IconButton>
                        <IconButton
                          sx={{ border: '1px solid', borderRadius: 1 }}
                          color="error"
                          onClick={() => handleRemove(index)}
                          aria-label="Remove tag">
                          <Icon path={mdiClose} size={1} />
                        </IconButton>
                      </Stack>
                    }
                    onChange={(_, option) => {
                      console.log(option);

                      // If an option from the dropdown was selected
                      if (typeof option !== 'string' && option) {
                        // Check if it's not already in the tags
                        if (!values.tags.some((tag) => tag.name.toLowerCase() === option.label.toLowerCase())) {
                          console.log('pushing selected option');
                          push({ name: option.label });
                        }
                        // Remove this text field from newTags since we've added the tag
                        handleRemove(index);
                      }
                      // If it's a string (free text input), we don't handle it here
                      // The user needs to click the save button to add free text as a tag
                    }}
                  />
                </Collapse>
              ))}
            </TransitionGroup>
          </Box>

          <Button
            variant="outlined"
            sx={{ fontWeight: 700, mt: 2 }}
            disabled={newTags.length > 0}
            startIcon={<Icon path={mdiPlus} size={1} />}
            onClick={handleCreateNewTag}>
            Add Tag
          </Button>
        </>
      )}
    </FieldArray>
  );
};
