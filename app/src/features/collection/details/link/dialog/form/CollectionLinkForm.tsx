import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import { useFormikContext } from 'formik';

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

/**
 * Form for creating or editing collection links
 */
const CollectionLinkForm = () => {
  const { values, touched, errors, handleChange, handleBlur } = useFormikContext<ICollectionLinkFormData>();

  return (
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
};

export default CollectionLinkForm;
