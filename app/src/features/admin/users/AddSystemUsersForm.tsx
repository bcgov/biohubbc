import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AutocompleteField, { IAutocompleteFieldOption } from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { SYSTEM_IDENTITY_SOURCE } from 'constants/auth';
import { useFormikContext } from 'formik';
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
  systemUser: IAddSystemUsersFormArrayItem;
}

export const AddSystemUsersFormArrayItemInitialValues: IAddSystemUsersFormArrayItem = {
  userIdentifier: '',
  displayName: '',
  email: '',
  identitySource: '',
  systemRole: '' as unknown as number
};

export const AddSystemUsersFormInitialValues: IAddSystemUsersForm = {
  systemUser: AddSystemUsersFormArrayItemInitialValues
};

export const AddSystemUsersFormYupSchema = yup.object().shape({
  systemUser: yup.object().shape({
    userIdentifier: yup.string().required('Username is required').min(1),
    displayName: yup.string().required('Display Name is required').min(1),
    email: yup.string().email('Must be a valid email').required('Email is required').min(1),
    identitySource: yup.string().required('Account Type is required'),
    systemRole: yup.number().required('System Role is required')
  })
});

export interface AddSystemUsersFormProps {
  systemRoles: IAutocompleteFieldOption<number>[];
}

/**
 * Returns form component for manually adding system users before access is requested
 *
 * @param props
 * @returns
 */
const AddSystemUsersForm: React.FC<AddSystemUsersFormProps> = (props) => {
  const { values, handleSubmit, getFieldMeta } = useFormikContext<IAddSystemUsersForm>();

  const userIdentifierMeta = getFieldMeta('systemUser.userIdentifier');
  const displayNameMeta = getFieldMeta('systemUser.displayName');
  const emailMeta = getFieldMeta('systemUser.email');

  const { systemRoles } = props;
  const identitySources: IAutocompleteFieldOption<string>[] = [
    { value: SYSTEM_IDENTITY_SOURCE.IDIR as string, label: SYSTEM_IDENTITY_SOURCE.IDIR },
    { value: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC as string, label: SYSTEM_IDENTITY_SOURCE.BCEID_BASIC },
    { value: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS as string, label: SYSTEM_IDENTITY_SOURCE.BCEID_BUSINESS },
    { value: SYSTEM_IDENTITY_SOURCE.UNVERIFIED as string, label: SYSTEM_IDENTITY_SOURCE.UNVERIFIED }
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Stack gap={1} flex="1 1 auto" direction="row">
          <Box flex={0.5}>
            <CustomTextField
              name="systemUser.userIdentifier"
              label="Username"
              placeholder="Enter the IDIR or BCeID"
              other={{
                required: true,
                value: values.systemUser.userIdentifier,
                error: userIdentifierMeta.touched && Boolean(userIdentifierMeta.error),
                helperText: userIdentifierMeta.touched && userIdentifierMeta.error
              }}
            />
          </Box>
          <AutocompleteField
            sx={{ flex: 0.5 }}
            name="systemUser.identitySource"
            id="systemUser.identitySource"
            label="Account Type"
            options={identitySources}
            required={true}
          />
        </Stack>
        <Box flex="1 1 auto">
          <CustomTextField
            name="systemUser.displayName"
            label="Display Name"
            placeholder="Enter a display name (eg. first and last name)"
            other={{
              required: true,
              value: values.systemUser.displayName,
              error: displayNameMeta.touched && Boolean(displayNameMeta.error),
              helperText: displayNameMeta.touched && displayNameMeta.error
            }}
          />
        </Box>
        <Box flex="1 1 auto">
          <CustomTextField
            name="systemUser.email"
            label="Email"
            placeholder="Enter the email associated with the account"
            other={{
              required: true,
              value: values.systemUser.email,
              error: emailMeta.touched && Boolean(emailMeta.error),
              helperText: emailMeta.touched && emailMeta.error
            }}
          />
        </Box>
        <Box flex="1 1 auto">
          <AutocompleteField
            sx={{ flex: 0.5 }}
            name="systemUser.systemRole"
            id="systemUser.systemRole"
            label="System Role"
            options={systemRoles}
            required={true}
          />
        </Box>
      </Stack>
    </form>
  );
};

export default AddSystemUsersForm;
