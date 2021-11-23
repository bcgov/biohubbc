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
      userIdentifier: yup.string().required('Required'),
      identitySource: yup.string().required('Required'),
      roleId: yup.number().required('Required')
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
          <Box>
            <Grid container direction="row" spacing={3}>
              {values.participants?.map((participant, index) => {
                const userIdentifierMeta = getFieldMeta(`participants.[${index}].userIdentifier`);
                const identitySourceMeta = getFieldMeta(`participants.[${index}].identitySource`);
                const roleIdMeta = getFieldMeta(`participants.[${index}].roleId`);

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
                      <Box flexBasis="30%" pl={1}>
                        <FormControl fullWidth variant="outlined" required={true} style={{ width: '100%' }}>
                          <InputLabel id="roleId">Username Type</InputLabel>
                          <Select
                            id={`participants.[${index}].identitySource`}
                            name={`participants.[${index}].identitySource`}
                            labelId="user_type"
                            label="User Type"
                            value={participant.identitySource}
                            labelWidth={300}
                            onChange={handleChange}
                            error={identitySourceMeta.touched && Boolean(identitySourceMeta.error)}
                            displayEmpty
                            inputProps={{ 'aria-label': 'Username Type' }}>
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
                          <InputLabel id="Id">Project Role</InputLabel>
                          <Select
                            id={`participants.[${index}].roleId`}
                            name={`participants.[${index}].roleId`}
                            labelId="project_role"
                            label="Project Role"
                            value={participant.roleId}
                            labelWidth={300}
                            onChange={handleChange}
                            error={roleIdMeta.touched && Boolean(roleIdMeta.error)}
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
                variant="outlined"
                color="primary"
                aria-label="add participant"
                data-testid="add-participant-button"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={() => arrayHelpers.push(AddProjectParticipantsFormArrayItemInitialValues)}>
                Add Participant
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default AddProjectParticipantsForm;
