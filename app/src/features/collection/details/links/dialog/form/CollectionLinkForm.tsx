import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { Formik, FormikProps } from 'formik';
import { ReactNode } from 'react';
import * as yup from 'yup';

//TECH DEBT:
//TO-DO:
// - ENSURE ALL ASPECTS OF THIS FORM AND OTHER FILES ARE COVERED BY UNIT TESTS
// - REMOVE SEED FILES BEFORE MERGING ANYWHERE
// - DO WE NEED THE ABILITY TO MULTI-DELETE LINKS?
// - DELETING IS A BIT BROKEN AND DOESNT RENDER PROPERLY? this might just be the docker status issue
// - Do we want to able to see the links in the collection details page? Without having to click into external resourses?

export interface ICollectionLinkFormData {
  name: string;
  description: string;
  url: string;
}

export interface ICollectionLinkFormProps {
  initialValues: ICollectionLinkFormData;
  onSubmit: (values: ICollectionLinkFormData) => void;
  renderForm: (formikProps: FormikProps<ICollectionLinkFormData> & { children: ReactNode }) => ReactNode;
}

const CollectionLinkFormValidationSchema = yup.object().shape({
  name: yup.string().required('Name is required').max(100, 'Name must be 100 characters or less'),
  description: yup.string().max(500, 'Description must be 500 characters or less'),
  url: yup
    .string()
    .required('URL is required')
    .url('Must be a valid URL')
    .max(500, 'URL must be 500 characters or less')
});

/**
 * Form for creating or editing collection links
 */
const CollectionLinkForm = (props: ICollectionLinkFormProps) => {
  const { initialValues, onSubmit, renderForm } = props;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={CollectionLinkFormValidationSchema}
      validateOnBlur={true}
      validateOnChange={false}
      onSubmit={onSubmit}>
      {(formikProps) => {
        const { values, touched, errors, handleChange, handleBlur } = formikProps;

        const formContent = (
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              id="name"
              name="name"
              label="Name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              required
            />

            <TextField
              fullWidth
              id="description"
              name="description"
              label="Description"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.description && Boolean(errors.description)}
              helperText={touched.description && errors.description}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              id="url"
              name="url"
              label="URL"
              value={values.url}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.url && Boolean(errors.url)}
              helperText={touched.url && errors.url}
              placeholder="https://example.com"
              required
            />
          </Box>
        );

        return renderForm({ ...formikProps, children: formContent });
      }}
    </Formik>
  );
};

export default CollectionLinkForm;
