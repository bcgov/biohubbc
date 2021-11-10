import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IEditReportMetaFormArrayItem {
  first_name: string;
  last_name: string;
}

export const EditReportMetaFormArrayItemInitialValues: IEditReportMetaFormArrayItem = {
  first_name: '',
  last_name: ''
};

export interface IEditReportMetaForm {
  title: string;
  authors: IEditReportMetaFormArrayItem[];
  description: string;
  year_published: number;
  revision_count: number;
}

export const EditReportMetaFormInitialValues: IEditReportMetaForm = {
  title: '',
  authors: [EditReportMetaFormArrayItemInitialValues],
  description: '',
  year_published: ('' as unknown) as number,
  revision_count: 0
};

export const EditReportMetaFormYupSchema = yup.object().shape({
  title: yup.string().max(300, 'Cannot exceed 300 characters').required('A report title is required'),
  description: yup.string().max(3000, 'Cannot exceed 3000 characters').required('A report summary is required'),
  year_published: yup
    .number()
    .min(1900, 'year must be between 1900 and 2199')
    .max(2199, 'Year must be between 1900 and 2199')
    .required('Year published required'),
  authors: yup
    .array()
    .min(1, 'An author is required')
    .of(
      yup.object().shape({
        first_name: yup.string().max(300, 'Cannot exceed 300 characters').required('First name required'),
        last_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Last name required')
      })
    )
    .isUniqueAuthor('Author names must be unique')
});

/**
 * Upload Report Meta Data
 *
 * @return {*}
 */
const EditReportMetaForm: React.FC = () => {
  const { values, getFieldMeta, errors } = useFormikContext<IEditReportMetaForm>();

  return (
    <>
      <Box component="fieldset">
        <Typography component="legend" variant="body1" id="report_details">
          Report Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <CustomTextField
              name="title"
              label="Report Title"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <CustomTextField
              name="year_published"
              label="Year Published"
              other={{
                required: true,
                type: 'number',
                placeholder: 'YYYY'
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="description"
              label="Report Summary"
              other={{ required: true, multiline: true, rows: 6 }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={4}>
        <Typography component="legend" variant="body1" id="report_details">
          Author(s)
        </Typography>
        <FieldArray
          name="authors"
          render={(arrayHelpers) => (
            <Box>
              <Grid container direction="row" spacing={3}>
                {values.authors?.map((author, index) => {
                  const authorFirstNameMeta = getFieldMeta(`authors.[${index}].first_name`);
                  const authorLastNameMeta = getFieldMeta(`authors.[${index}].last_name`);

                  return (
                    <Grid item xs={12} key={index}>
                      <Box display="flex">
                        <Box flexBasis="50%" pr={1}>
                          <CustomTextField
                            name={`authors.[${index}].first_name`}
                            label="First Name"
                            other={{
                              required: true,
                              value: author.first_name,
                              error: authorFirstNameMeta.touched && Boolean(authorFirstNameMeta.error),
                              helperText: authorFirstNameMeta.touched && authorFirstNameMeta.error
                            }}
                          />
                        </Box>

                        <Box flexBasis="50%" pr={1}>
                          <CustomTextField
                            name={`authors.[${index}].last_name`}
                            label="Last Name"
                            other={{
                              required: true,
                              value: author.last_name,
                              error: authorLastNameMeta.touched && Boolean(authorLastNameMeta.error),
                              helperText: authorLastNameMeta.touched && authorLastNameMeta.error
                            }}
                          />
                        </Box>

                        {
                          <Box mt={0.75}>
                            <IconButton
                              data-testid="delete-author-icon"
                              aria-label="remove author"
                              onClick={() => arrayHelpers.remove(index)}>
                              <Icon path={mdiTrashCanOutline} size={1} />
                            </IconButton>
                          </Box>
                        }
                      </Box>
                    </Grid>
                  );
                })}
              </Grid>

              {errors?.authors && !Array.isArray(errors?.authors) && (
                <Box pt={2}>
                  <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.authors}</Typography>
                </Box>
              )}

              <Box pt={2}>
                <Button
                  color="primary"
                  size="small"
                  variant="text"
                  startIcon={<Icon path={mdiPlus} size={1} />}
                  aria-label="add author"
                  onClick={() => arrayHelpers.push(EditReportMetaFormArrayItemInitialValues)}>
                  <strong>Add Author</strong>
                </Button>
              </Box>
            </Box>
          )}
        />
      </Box>
    </>
  );
};

export default EditReportMetaForm;
