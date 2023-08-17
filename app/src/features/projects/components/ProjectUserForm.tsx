import { Box, Typography } from '@mui/material';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { ICreateProjectRequest } from 'interfaces/useProjectApi.interface';
import { debounce } from 'lodash';
import { useMemo } from 'react';
import yup from 'utils/YupSchema';

export const AddProjectUser = yup.object().shape({
  users: yup.array().of(
    yup.object().shape({
      user_id: yup.string().required('Username is required'),
      role_id: yup.string().required('Display Name is required')
    })
  )
});

interface IProjectUser {
  users: any[];
}
const ProjectUserForm: React.FC<IProjectUser> = (props) => {
  const { handleSubmit } = useFormikContext<ICreateProjectRequest>();
  const biohubApi = useBiohubApi();

  const handleSearch = useMemo(
    () =>
      debounce(async (inputValue: string) => {
        const response = await biohubApi.user.searchSystemUser(inputValue.toLowerCase());
        // const newOptions = convertOptions(response.searchResponse).filter(
        //   (item) => !existingValues?.includes(item.value)
        // );
        console.log(response);
        // callback([]);
      }, 500),
    [biohubApi.user]
  );

  return (
    <form onSubmit={handleSubmit}>
      <Box component="fieldset">
        <Typography component="legend" variant="h5">
          Add Team Members
        </Typography>
        <Typography variant="body1" color="textSecondary" style={{ maxWidth: '90ch' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam at porttitor sem. Aliquam erat volutpat.
          Donec placerat nisl magna, et faucibus arcu condimentum sed.
        </Typography>
      </Box>
      <Box mt={3}>
        <CustomTextField
          label="Search for users"
          name="user-search"
          other={{
            onChange: (event) => {
              handleSearch(event.target.value);
            }
          }}
        />
        {/* <Autocomplete
          options={[1, 2, 3, 4]}
          renderInput={(params) => (
            <Box>
              <TextField {...params} />
            </Box>
          )}
        /> */}
      </Box>
      {/* <Box> Assign Role Errors</Box> */}
      <FieldArray name="" render={(arrayHelpers: FieldArrayRenderProps) => <Box></Box>} />
      <Box>
        <Box>
          <Typography variant="h5">User One</Typography>
          <Box display={'flex'}>
            <Typography variant="subtitle2">user1@email.com</Typography>
            <Typography sx={{ marginX: 1 }} variant="subtitle2">
              Agency
            </Typography>
            <Typography variant="subtitle2">BCId</Typography>
          </Box>
        </Box>
      </Box>
    </form>
  );
};

export default ProjectUserForm;
