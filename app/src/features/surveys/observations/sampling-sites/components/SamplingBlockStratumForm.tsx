import React from 'react';
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

interface ISamplingBlockStratumFormProps {
  label: string;
  subHeader: string;
  options: ISelectWithSubtextFieldOption[] | undefined;
  arrayFieldName: string;
  addButtonLabel: string;
}

const SamplingBlockStratumForm: React.FC<ISamplingBlockStratumFormProps> = ({
  label,
  subHeader,
  options,
  arrayFieldName,
  addButtonLabel,
}) => {
  const { values, setFieldValue } = useFormikContext<any>();

  const handleAddItem = () => {
    const newItem = {
      id: values[arrayFieldName].length,
      stratum: null,
    };

    setFieldValue(arrayFieldName, [...values[arrayFieldName], newItem]);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = values[arrayFieldName].filter((_: any, i: number) => i !== index);
    setFieldValue(arrayFieldName, updatedItems);
  };

  return ( options ?
    <>
      <Typography component="legend">{label}</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 3,
          maxWidth: '92ch',
        }}
      >{subHeader}</Typography>
      <FieldArray
        name={arrayFieldName}
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <Box sx={{ mb: 3, maxWidth: '92ch' }}>
              <List dense disablePadding>
                {values[arrayFieldName].map((item: any, index: number) => (
                  <ListItem disableGutters key={index}>
                    <ListItemText>
                      <SelectWithSubtextField
                        id={`samplingSiteItem-${index}`}
                        label={label}
                        name={`${arrayFieldName}.${index}.stratum`}
                        options={options}
                      />
                    </ListItemText>
                    <ListItemSecondaryAction>
                      <IconButton
                        data-testid={`delete-icon-${index}`}
                        aria-label={`remove ${label}`}
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
                  aria-label={`add ${label}`}
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  onClick={handleAddItem}
                >
                  {addButtonLabel}
                </Button>
              </Box>
            </Box>
          </>
        )}
      />
    </> : null
  );
};

export default SamplingBlockStratumForm;
