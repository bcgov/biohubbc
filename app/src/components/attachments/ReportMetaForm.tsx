import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import Button from '@material-ui/core/Button';
import yup from 'utils/YupSchema';
import CustomTextField from 'components/fields/CustomTextField';
import { Box } from '@material-ui/core';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import FormLabel from '@material-ui/core/FormLabel';
import Typography from '@material-ui/core/Typography';

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
}

export const ReportMetaFormInitialValues: IReportMetaForm = {
  title: '',
  authors: [ReportMetaFormArrayItemInitialValues, ReportMetaFormArrayItemInitialValues],
  description: '',
  year_published: '',
  attachmentId: 0
};

export const ReportMetaFormYupSchema = yup.object().shape({
  title: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  description: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  year_published: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  attachmentId: yup.number().min(1, 'Must have a file uploaded').required('Required')
});

export const ReportMetaFormArrayItemYupSchema = yup.object().shape({
  first_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required'),
  last_name: yup.string().max(50, 'Cannot exceed 50 characters').required('Required')
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
        <FormLabel id="report_details" component="legend">
          Report Details
        </FormLabel>
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
              other={{ required: true, multiline: true, rows: 4 }}
            />
          </Grid>
        </Grid>
      </Box>

      <Box component="fieldset" mt={5}>
        <FormLabel id="report_details" component="legend">
          Author(s)
        </FormLabel>

        <Grid>
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
                            <Box pt={0.5} pl={1}>
                              <IconButton
                                color="primary"
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
                    type="button"
                    variant="outlined"
                    color="primary"
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
              </Box>
            )}
          />
        </Grid>
      </Box>
    </form>
  );
};

export default ReportMetaForm;
