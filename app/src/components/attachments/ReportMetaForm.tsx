import { Box } from '@material-ui/core';
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

export interface IReportMetaFormArrayItem {
  first_name: string;
  last_name: string;
}

export const ReportMetaFormArrayItemInitialValues: IReportMetaFormArrayItem = {
  first_name: '',
  last_name: ''
};

export interface IReportMetaForm {
  title: string;
  authors: IReportMetaFormArrayItem[];
  description: string;
  year_published: string;
  attachmentId: number;
  revision_count: number;
}

export const ReportMetaFormInitialValues: IReportMetaForm = {
  title: '',
  authors: [ReportMetaFormArrayItemInitialValues],
  description: '',
  year_published: '',
  attachmentId: 0,
  revision_count: 0
};

export const ReportMetaFormYupSchema = yup.object().shape({
  title: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
  description: yup.string().max(300, 'Cannot exceed 50 characters').required('Required'),
  year_published: yup
    .number()
    .min(1900, 'year must be between 1900 and 2199')
    .max(2199, 'Year must be between 1900 and 2199'),
  attachmentId: yup.number().min(1, 'Must have a file uploaded').required('Required'),
  revision_count: yup.number().min(0, 'Must have a revision number').required('Required'),
  authors: yup
    .array()
    .of(
      yup.object().shape({
        first_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required'),
        last_name: yup.string().max(300, 'Cannot exceed 300 characters').required('Required')
      })
    )
    .isUniqueAuthor('Authors must be unique')
});

/**
 * Upload Report Meta Data
 *
 * @return {*}
 */

const ReportMetaForm: React.FC = (props) => {
  const { values, handleSubmit, getFieldMeta, errors } = useFormikContext<IReportMetaForm>();

  return (
    <form onSubmit={handleSubmit}>
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
              label="Year Published - YYYY"
              other={{
                required: true
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name="description"
              label="Report Abstract"
              other={{ required: true, multiline: true, rows: 3 }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={5}>
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
                      <Box display="flex" alignItems="center">
                        <Box flexBasis="50%" pr={1}>
                          <CustomTextField
                            name={`authors.[${index}].first_name`}
                            label="First Name"
                            other={{
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
                          <Box>
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
                  onClick={() => arrayHelpers.push(ReportMetaFormArrayItemInitialValues)}>
                  Add Author
                </Button>
              </Box>

              {errors?.attachmentId && (
                <Box pt={4}>
                  <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.attachmentId}</Typography>
                </Box>
              )}
              {errors?.revision_count && (
                <Box pt={4}>
                  <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.revision_count}</Typography>
                </Box>
              )}
            </Box>
          )}
        />
      </Box>
    </form>
  );
};

export default ReportMetaForm;
