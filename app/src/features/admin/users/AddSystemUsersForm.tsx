import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IAddSystemUsersFormArrayItem {
  userIdentifier: string;
  identitySource: string;
  system_role: number;
}

export interface IAddSystemUsersForm {
  participants: IAddSystemUsersFormArrayItem[];
}

export const AddSystemUsersFormArrayItemInitialValues: IAddSystemUsersFormArrayItem = {
  userIdentifier: '',
  identitySource: '',
  system_role: ('' as unknown) as number
};

export const AddSystemUsersFormInitialValues: IAddSystemUsersForm = {
  participants: [AddSystemUsersFormArrayItemInitialValues]
};

export const AddSystemUsersFormYupSchema = yup.object().shape({
  participants: yup.array().of(
    yup.object().shape({
      userIdentifier: yup.string().required('Username is required'),
      identitySource: yup.string().required('Login Method is required'),
      system_role: yup.number().required('Role is required')
    })
  )
});

export interface AddSystemUsersFormProps {
  system_roles: any[];
}

const AddSystemUsersForm: React.FC<AddSystemUsersFormProps> = (props) => {
  const { values, handleChange, handleSubmit, getFieldMeta } = useFormikContext<IAddSystemUsersForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="participants"
        render={(arrayHelpers) => (
          <Box>
            <Grid container direction="row" spacing={2}>
              {values.participants?.map((participant, index) => {
                const userIdentifierMeta = getFieldMeta(`participants.[${index}].userIdentifier`);
                const identitySourceMeta = getFieldMeta(`participants.[${index}].identitySource`);
                const systemRoleMeta = getFieldMeta(`participants.[${index}].roleId`);

                return (
                  <Grid item xs={12} key={index}>
                    <Box display="flex">
                      <Box flexBasis="35%">
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
                      <Box flexBasis="25%" pl={1}>
                        <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
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
                            error={identitySourceMeta.touched && Boolean(identitySourceMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Login Method' }}>
                            <MenuItem key={'IDIR'} value={'IDIR'}>
                              IDIR
                            </MenuItem>
                            <MenuItem key={'BCEID'} value={'BCEID'}>
                              BCEID
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
                            id={`participants.[${index}].system_role`}
                            name={`participants.[${index}].system_role`}
                            labelId="system_role"
                            label="System Role"
                            value={participant.system_role}
                            labelWidth={300}
                            onChange={handleChange}
                            error={systemRoleMeta.touched && Boolean(systemRoleMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'System Role' }}>


                            {props?.system_roles?.map((item) => (
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
                <strong>Add System Users</strong>
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default AddSystemUsersForm;
