import { mdiClose, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AlertBar from 'components/alert/AlertBar';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { get } from 'lodash-es';
import React, { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';
import yup from 'utils/YupSchema';

export interface ISurveyPermit {
  permit_id?: number;
  permit_number: string;
  permit_type: string;
}

export interface ISurveyPermitForm {
  permit: {
    used: boolean | null;
    permits: ISurveyPermit[];
  };
}

export const SurveyPermitFormArrayItemInitialValues: ISurveyPermit = {
  permit_id: null as unknown as number,
  permit_number: '',
  permit_type: ''
};

export const SurveyPermitFormInitialValues: ISurveyPermitForm = {
  permit: {
    used: null,
    permits: []
  }
};

export const SurveyPermitFormYupSchema = yup.object().shape({
  permit: yup.object().shape({
    used: yup.boolean().nullable().required('You must indicate whether a permit was used'),
    permits: yup
      .array()
      .of(
        yup.object().shape({
          permit_id: yup.number().nullable(true),
          permit_number: yup
            .string()
            .max(100, 'Cannot exceed 100 characters')
            .required('Permit Number is Required')
            .test('is-unique-permit-number', 'Permit numbers must be unique', function (permitNumber) {
              const formValues = this.options.context;

              if (!formValues?.permit?.permits?.length) {
                return true;
              }

              return (
                formValues.permit.permits.filter((permit: ISurveyPermit) => permit.permit_number === permitNumber)
                  .length <= 1
              );
            }),
          permit_type: yup.string().required('Permit Type is Required')
        })
      )
      .test('is-permit-used', 'You must add at least one permit', function (permits) {
        const formValues = this.options.context;

        if (!formValues?.permit?.used) {
          return true;
        }

        return !!permits?.length;
      })
  })
});

/**
 * Create Survey - Permit section
 *
 * @return {*}
 */
const SurveyPermitForm: React.FC = () => {
  const { values, handleChange, getFieldMeta, errors, setFieldValue, submitCount } =
    useFormikContext<ISurveyPermitForm>();

  useEffect(() => {
    setFieldValue('permit.used', values.permit.used);
  }, [setFieldValue, values.permit]);

  const getPermitUsedValue = () => {
    if (values.permit.used === true) {
      return 'true';
    }
    if (values.permit.used === false) {
      return 'false';
    }
    return null;
  };

  return (
    <FieldArray
      name="permit.permits"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <Stack gap={1}>
          {get(errors, 'permit.used') && submitCount > 0 && (
            <AlertBar
              severity="error"
              variant="outlined"
              title="Permit Declaration missing"
              text={get(errors, 'permit.used') || 'Indicate whether a permit was used'}
            />
          )}
          <RadioGroup
            aria-label="permit"
            name="permit.used"
            value={getPermitUsedValue()}
            onChange={(event) => {
              const permitsUsed = event.target.value === 'true' ? true : false;
              setFieldValue('permit.used', permitsUsed);
              if (permitsUsed) {
                setFieldValue('permit.permits', [SurveyPermitFormArrayItemInitialValues]);
              } else if (!permitsUsed) {
                setFieldValue('permit.permits', []);
              }
            }}>
            <FormControlLabel value="true" control={<Radio required={true} color="primary" />} label="Yes" />
            <FormControlLabel value="false" control={<Radio required={true} color="primary" />} label="No" />
          </RadioGroup>

          <TransitionGroup
            component={Stack}
            role="list"
            gap={1}
            sx={{
              '&:not(:has(div[role=listitem]))': {
                display: 'none'
              }
            }}>
            {values.permit.permits?.map((permit: ISurveyPermit, index) => {
              const permitNumberMeta = getFieldMeta(`permit.permits.[${index}].permit_number`);
              const permitTypeMeta = getFieldMeta(`permit.permits.[${index}].permit_type`);

              return (
                <Collapse role="listitem" key={index}>
                  <Card
                    component={Stack}
                    variant="outlined"
                    flexDirection="row"
                    alignItems="flex-start"
                    gap={2}
                    sx={{
                      width: '100%',
                      p: 2,
                      backgroundColor: grey[100]
                    }}>
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

                    <IconButton
                      data-testid="delete-icon"
                      aria-label="Remove permit from survey"
                      onClick={() => arrayHelpers.remove(index)}
                      sx={{
                        mt: 1.125
                      }}>
                      <Icon path={mdiClose} size={1} />
                    </IconButton>
                  </Card>
                </Collapse>
              );
            })}
          </TransitionGroup>
          {errors.permit?.permits && !Array.isArray(errors?.permit.permits) && (
            <Box pt={2}>
              <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.permit.permits}</Typography>
            </Box>
          )}
          {values.permit.used && (
            <Button
              type="button"
              variant="outlined"
              color="primary"
              startIcon={<Icon path={mdiPlus} size={1} />}
              onClick={() => arrayHelpers.push(SurveyPermitFormArrayItemInitialValues)}
              sx={{
                alignSelf: 'flex-start',
                mt: 1
              }}>
              Add New Permit
            </Button>
          )}
        </Stack>
      )}
    />
  );
};

export default SurveyPermitForm;
