import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

const useStyles = makeStyles((theme: Theme) => ({
  permitList: {
    '& li:first-of-type': {
      marginTop: theme.spacing(-1.5)
    },
    '& .MuiListItemSecondaryAction-root': {
      top: '35px'
    }
  }
}));

export interface ISurveyPermitFormArrayItem {
  permit_id: number;
  permit_number: string;
  permit_type: string;
}

export interface ISurveyPermitForm {
  permit: {
    permits: ISurveyPermitFormArrayItem[];
  };
}

export const SurveyPermitFormArrayItemInitialValues: ISurveyPermitFormArrayItem = {
  permit_id: null as unknown as number,
  permit_number: '',
  permit_type: ''
};

export const SurveyPermitFormInitialValues: ISurveyPermitForm = {
  permit: {
    permits: []
  }
};

export const SurveyPermitFormYupSchema = yup.object().shape({
  permit: yup.object().shape({
    permits: yup
      .array()
      .of(
        yup.object().shape({
          permit_id: yup.number().nullable(true),
          permit_number: yup.string().max(100, 'Cannot exceed 100 characters').required('Permit Number is Required'),
          permit_type: yup.string().required('Permit Type is Required')
        })
      )
      .isUniquePermitNumber('Permit numbers must be unique')
  })
});

/**
 * Create Survey - Permit section
 *
 * @return {*}
 */
const SurveyPermitForm: React.FC = () => {
  const classes = useStyles();
  const { values, handleChange, getFieldMeta, errors } = useFormikContext<ISurveyPermitForm>();

  return (
    <FieldArray
      name="permit.permits"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <List dense disablePadding className={classes.permitList}>
            {values.permit.permits?.map((permit, index) => {
              const permitNumberMeta = getFieldMeta(`permit.permits.[${index}].permit_number`);
              const permitTypeMeta = getFieldMeta(`permit.permits.[${index}].permit_type`);

              return (
                <ListItem disableGutters key={index}>
                  <ListItemText>
                    <Box>
                      <Grid container spacing={2}>
                        <Grid item sm={6}>
                          <CustomTextField
                            name={`permit.permits.[${index}].permit_number`}
                            label="Permit Number"
                            other={{
                              required: true,
                              value: permit.permit_number,
                              error: permitNumberMeta.touched && Boolean(permitNumberMeta.error),
                              helperText: permitNumberMeta.touched && permitNumberMeta.error
                            }}
                          />
                        </Grid>
                        <Grid item sm={6}>
                          <FormControl
                            variant="outlined"
                            fullWidth
                            required={true}
                            error={permitTypeMeta.touched && Boolean(permitTypeMeta.error)}>
                            <InputLabel id="permit_type">Permit Type</InputLabel>
                            <Select
                              id={`permit.permits.[${index}].permit_type`}
                              name={`permit.permits.[${index}].permit_type`}
                              labelId="permit_type"
                              label="Permit Type"
                              value={permit.permit_type}
                              onChange={handleChange}
                              displayEmpty
                              inputProps={{ 'aria-label': 'Permit Type' }}>
                              <MenuItem key={1} value="Park Use Permit">
                                Park Use Permit
                              </MenuItem>
                              <MenuItem key={2} value="Wildlife Permit - General">
                                Wildlife Permit - General
                              </MenuItem>
                              <MenuItem key={3} value="Scientific Fish Collection Permit">
                                Scientific Fish Collection Permit
                              </MenuItem>
                            </Select>
                            <FormHelperText>{permitTypeMeta.touched && permitTypeMeta.error}</FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton
                      data-testid="delete-icon"
                      aria-label="remove permit"
                      onClick={() => arrayHelpers.remove(index)}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          {errors.permit?.permits && !Array.isArray(errors?.permit.permits) && (
            <Box pt={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.permit.permits}</Typography>
            </Box>
          )}
          <Box>
            <Button
              type="button"
              variant="outlined"
              color="primary"
              aria-label="add permit"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => arrayHelpers.push(SurveyPermitFormArrayItemInitialValues)}>
              Add New Permit
            </Button>
          </Box>
        </>
      )}
    />
  );
};

export default SurveyPermitForm;
