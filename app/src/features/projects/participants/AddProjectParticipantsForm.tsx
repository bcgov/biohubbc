import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import { SYSTEM_IDENTITY_SOURCE } from 'hooks/useKeycloakWrapper';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddProjectParticipantsFormArrayItem {
  userIdentifier: string;
  identitySource: string;
  roleId: number;
}

export interface IAddProjectParticipantsForm {
  participants: IAddProjectParticipantsFormArrayItem[];
}

export const AddProjectParticipantsFormArrayItemInitialValues: IAddProjectParticipantsFormArrayItem = {
  userIdentifier: '',
  identitySource: '',
  roleId: ('' as unknown) as number
};

export const AddProjectParticipantsFormInitialValues: IAddProjectParticipantsForm = {
  participants: [AddProjectParticipantsFormArrayItemInitialValues]
};

export const AddProjectParticipantsFormYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      userIdentifier: yup.string().required('Username is required'),
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
        render={(arrayHelpers) => (
          <>
            <Box>
              {values.participants?.map((participant, index) => {
                const userIdentifierMeta = getFieldMeta(`participants.[${index}].userIdentifier`);
                const identitySourceMeta = getFieldMeta(`participants.[${index}].identitySource`);
                const roleIdMeta = getFieldMeta(`participants.[${index}].roleId`);

                return (
                  <Box key={index}>
                    <Box display="flex" overflow="visible" m={-0.5}>
                      <Box display="flex" flex="1 1 auto">
                        <Box py={1} px={0.5} flex="0 0 33.3333%">
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
                        <Box py={1} px={0.5} flex="0 0 33.3333%">
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
                              labelWidth={300}
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
                        <Box py={1} px={0.5} flex="0 0 33.3333%">
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
                              labelWidth={300}
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
                      <Box pt={1.5} pl={1} flex="0 0 auto">
                        <IconButton
                          data-testid="delete-icon"
                          aria-label="remove participant"
                          onClick={() => arrayHelpers.remove(index)}>
                          <Icon path={mdiTrashCanOutline} size={1} />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
            <Box mt={1}>
              <Button
                type="button"
                variant="text"
                color="primary"
                aria-label="add new team member"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddProjectParticipantsFormArrayItemInitialValues)}>
                <strong>Add New</strong>
              </Button>
            </Box>
          </>
        )}
      />
    </form>
  );
};

export default AddProjectParticipantsForm;
