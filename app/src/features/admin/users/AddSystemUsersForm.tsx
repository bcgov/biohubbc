import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import CustomTextField from 'components/fields/CustomTextField';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddSystemUsersFormArrayItem {
  userIdentifier: string;
  displayName: string;
  email: string;
  identitySource: string;
  systemRole: number;
}

export interface IAddSystemUsersForm {
  systemUsers: IAddSystemUsersFormArrayItem[];
}

export const AddSystemUsersFormArrayItemInitialValues: IAddSystemUsersFormArrayItem = {
  userIdentifier: '',
  displayName: '',
  email: '',
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
      displayName: yup.string().required('Display Name is required'),
      email: yup.string().email('Must be a valid email').required('Email is required'),
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
          <Box pt={1}>
            <Grid container direction="row" spacing={2}>
              {values.systemUsers?.map((systemUser: IAddSystemUsersFormArrayItem, index: number) => {
                const userIdentifierMeta = getFieldMeta(`systemUsers.[${index}].userIdentifier`);
                const displayNameMeta = getFieldMeta(`systemUsers.[${index}].displayName`);
                const emailMeta = getFieldMeta(`systemUsers.[${index}].email`);
                const identitySourceMeta = getFieldMeta(`systemUsers.[${index}].identitySource`);
                const systemRoleMeta = getFieldMeta(`systemUsers.[${index}].roleId`);

                return (
                  <Grid item xs={12} key={index}>
                    <Box display="flex">
                      <Box display="flex" flex="1 1 auto" alignItems="stretch">
                        <Box flex="1 1 auto">
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
                        <Box pl={1} width={220}>
                          <CustomTextField
                            name={`systemUsers.[${index}].displayName`}
                            label="Display Name"
                            other={{
                              required: true,
                              value: systemUser.displayName,
                              error: displayNameMeta.touched && Boolean(displayNameMeta.error),
                              helperText: displayNameMeta.touched && displayNameMeta.error
                            }}
                          />
                        </Box>
                        <Box pl={1} width={220}>
                          <CustomTextField
                            name={`systemUsers.[${index}].email`}
                            label="Email"
                            other={{
                              required: true,
                              value: systemUser.email,
                              error: emailMeta.touched && Boolean(emailMeta.error),
                              helperText: emailMeta.touched && emailMeta.error
                            }}
                          />
                        </Box>
                        <Box pl={1} width={220}>
                          <FormControl fullWidth variant="outlined" required={true}>
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
                        <Box pl={1} width={220}>
                          <FormControl fullWidth variant="outlined" required={true}>
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
                      </Box>
                      <Box flex="0 0 auto" pl={1}>
                        <IconButton
                          data-testid="delete-icon"
                          aria-label="remove participant"
                          onClick={() => arrayHelpers.remove(index)}
                          sx={{
                            marginTop: '8px'
                          }}>
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
                color="primary"
                variant="outlined"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddSystemUsersFormArrayItemInitialValues)}>
                Add User
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default AddSystemUsersForm;
