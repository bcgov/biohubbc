import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddSystemUsersFormArrayItem {
  userIdentifier: string;
  identitySource: string;
  systemRole: number;
}

export interface IAddSystemUsersForm {
  systemUsers: IAddSystemUsersFormArrayItem[];
}

export const AddSystemUsersFormArrayItemInitialValues: IAddSystemUsersFormArrayItem = {
  userIdentifier: '',
  identitySource: '',
  systemRole: '' as unknown as number
};

export const AddSystemUsersFormInitialValues: IAddSystemUsersForm = {
  systemUsers: [AddSystemUsersFormArrayItemInitialValues]
};

export const AddSystemUsersFormYupSchema = yup.object().shape({
  systemUsers: yup.array().of(
    yup.object().shape({
      userIdentifier: yup.string().required('Username is required'),
      identitySource: yup.string().required('Login Method is required'),
      systemRole: yup.number().required('Role is required')
    })
  )
});

export interface AddSystemUsersFormProps {
  systemRoles: any[];
}

const AddSystemUsersForm: React.FC<AddSystemUsersFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta } = useFormikContext<IAddSystemUsersForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="systemUsers"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            <Grid container direction="row" spacing={2}>
              {values.systemUsers?.map((systemUser: IAddSystemUsersFormArrayItem, index: number) => {
                const userIdentifierMeta = getFieldMeta(`systemUsers.[${index}].userIdentifier`);
                const identitySourceMeta = getFieldMeta(`systemUsers.[${index}].identitySource`);
                const systemRoleMeta = getFieldMeta(`systemUsers.[${index}].roleId`);

                return (
                  <Grid item xs={12} key={index}>
                    <Box display="flex">
                      <Box flexBasis="35%">
                        <CustomTextField
                          name={`systemUsers.[${index}].userIdentifier`}
                          label="Username"
                          other={{
                            required: true,
                            value: systemUser.userIdentifier,
                            error: userIdentifierMeta.touched && Boolean(userIdentifierMeta.error),
                            helperText: userIdentifierMeta.touched && userIdentifierMeta.error
                          }}
                        />
                      </Box>
                      <Box flexBasis="25%" pl={1}>
                        <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                          <InputLabel id="loginMethod" required={false}>
                            Login Method
                          </InputLabel>
                          <Select
                            id={`systemUsers.[${index}].identitySource`}
                            name={`systemUsers.[${index}].identitySource`}
                            labelId="login_method"
                            label="Login Method"
                            value={systemUser.identitySource}
                            onChange={handleChange}
                            error={identitySourceMeta.touched && Boolean(identitySourceMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Login Method' }}>
                            <MenuItem key={SYSTEM_IDENTITY_SOURCE.IDIR} value={SYSTEM_IDENTITY_SOURCE.IDIR}>
                              IDIR
                            </MenuItem>
                            <MenuItem
                              key={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC}
                              value={SYSTEM_IDENTITY_SOURCE.BCEID_BASIC}>
                              BCeID Basic
                            </MenuItem>
                            <MenuItem
                              key={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS}
                              value={SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS}>
                              BCeID Business
                            </MenuItem>
                          </Select>
                          <FormHelperText>{identitySourceMeta.touched && identitySourceMeta.error}</FormHelperText>
                        </FormControl>
                      </Box>
                      <Box flexBasis="35%" pl={1}>
                        <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                          <InputLabel id="Id" required={false}>
                            System Role
                          </InputLabel>
                          <Select
                            id={`systemUsers.[${index}].systemRole`}
                            name={`systemUsers.[${index}].systemRole`}
                            labelId="systemRole"
                            label="System Role"
                            value={systemUser.systemRole}
                            onChange={handleChange}
                            error={systemRoleMeta.touched && Boolean(systemRoleMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'System Role' }}>
                            {props?.systemRoles?.map((item) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                          </Select>
                          <FormHelperText>{systemRoleMeta.touched && systemRoleMeta.error}</FormHelperText>
                        </FormControl>
                      </Box>
                      <Box pt={0.5} pl={1}>
                        <IconButton
                          color="primary"
                          data-testid="delete-icon"
                          aria-label="remove participant"
                          onClick={() => arrayHelpers.remove(index)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Box pt={2}>
              <Button
                type="button"
                variant="text"
                color="primary"
                aria-label="add participant"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddSystemUsersFormArrayItemInitialValues)}>
                <strong>Add New</strong>
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default AddSystemUsersForm;
