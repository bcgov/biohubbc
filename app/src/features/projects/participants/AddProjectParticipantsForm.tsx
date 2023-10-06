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
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddProjectParticipantsFormArrayItem {
  userIdentifier: string;
  displayName: string;
  email: string;
  identitySource: string;
  roleId: number;
}

export interface IAddProjectParticipantsForm {
  participants: IAddProjectParticipantsFormArrayItem[];
}

export const AddProjectParticipantsFormArrayItemInitialValues: IAddProjectParticipantsFormArrayItem = {
  userIdentifier: '',
  displayName: '',
  email: '',
  identitySource: '',
  roleId: '' as unknown as number
};

export const AddProjectParticipantsFormInitialValues: IAddProjectParticipantsForm = {
  participants: [AddProjectParticipantsFormArrayItemInitialValues]
};

export const AddProjectParticipantsFormYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      userIdentifier: yup.string().required('Username is required'),
      displayName: yup.string().required('Display Name is required'),
      email: yup.string().email('Must be a valid email').required('Email is required'),
      identitySource: yup.string().required('Login Method is required'),
      roleId: yup.number().required('Role is required')
    })
  )
});

export interface AddProjectParticipantsFormProps {
  project_roles: any[];
}

const AddProjectParticipantsForm: React.FC<AddProjectParticipantsFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta } = useFormikContext<IAddProjectParticipantsForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="participants"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <Grid container direction="row" spacing={2}>
              {values.participants?.map((participant, index) => {
                const userIdentifierMeta = getFieldMeta(`participants.[${index}].userIdentifier`);
                const displayNameMeta = getFieldMeta(`participants.[${index}].displayName`);
                const emailMeta = getFieldMeta(`participants.[${index}].email`);
                const identitySourceMeta = getFieldMeta(`participants.[${index}].identitySource`);
                const roleIdMeta = getFieldMeta(`participants.[${index}].roleId`);

                return (
                  <Grid item xs={12} key={`${index}-${participant.roleId}`}>
                    <Box>
                      <Box display="flex" overflow="visible">
                        <Box display="flex" flex="1 1 auto">
                          <Box flex="1 1 auto">
                            <CustomTextField
                              name={`participants.[${index}].userIdentifier`}
                              label="Username"
                              other={{
                                required: true,
                                value: participant.userIdentifier,
                                error: userIdentifierMeta.touched && Boolean(userIdentifierMeta.error),
                                helperText: userIdentifierMeta.touched && userIdentifierMeta.error
                              }}
                            />
                          </Box>
                          <Box pl={1} width={220}>
                            <CustomTextField
                              name={`participants.[${index}].displayName`}
                              label="Display Name"
                              other={{
                                required: true,
                                value: participant.displayName,
                                error: displayNameMeta.touched && Boolean(displayNameMeta.error),
                                helperText: displayNameMeta.touched && displayNameMeta.error
                              }}
                            />
                          </Box>
                          <Box pl={1} width={220}>
                            <CustomTextField
                              name={`participants.[${index}].email`}
                              label="Email"
                              other={{
                                required: true,
                                value: participant.email,
                                error: emailMeta.touched && Boolean(emailMeta.error),
                                helperText: emailMeta.touched && emailMeta.error
                              }}
                            />
                          </Box>
                          <Box pl={1} width={220}>
                            <FormControl
                              fullWidth
                              variant="outlined"
                              required={true}
                              error={identitySourceMeta.touched && Boolean(identitySourceMeta.error)}>
                              <InputLabel id="loginMethod" required={false}>
                                Login Method
                              </InputLabel>
                              <Select
                                id={`participants.[${index}].identitySource`}
                                name={`participants.[${index}].identitySource`}
                                labelId="login_method"
                                label="Login Method"
                                value={participant.identitySource}
                                onChange={handleChange}
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
                            <FormControl
                              fullWidth
                              variant="outlined"
                              required={true}
                              error={roleIdMeta.touched && Boolean(roleIdMeta.error)}>
                              <InputLabel id="Id" required={false}>
                                Project Role
                              </InputLabel>
                              <Select
                                id={`participants.[${index}].roleId`}
                                name={`participants.[${index}].roleId`}
                                labelId="project_role"
                                label="Project Role"
                                value={participant.roleId}
                                onChange={handleChange}
                                displayEmpty
                                inputProps={{ 'aria-label': 'Project Role' }}>
                                {props.project_roles.map((item) => (
                                  <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                  </MenuItem>
                                ))}
                              </Select>
                              <FormHelperText>{roleIdMeta.touched && roleIdMeta.error}</FormHelperText>
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
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
            <Box mt={2}>
              <Button
                color="primary"
                variant="outlined"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddProjectParticipantsFormArrayItemInitialValues)}>
                Add Team Member
              </Button>
            </Box>
          </>
        )}
      />
    </form>
  );
};

export default AddProjectParticipantsForm;
