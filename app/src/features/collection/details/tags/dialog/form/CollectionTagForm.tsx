import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { COLLECTION_ROLE } from 'constants/roles';
import GeneralInformationCollectionForm from 'features/collection/edit/general/GeneralInformationCollectionForm';
import { useFormikContext } from 'formik';
import { ICollectionParticipant, ICreateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useEffect, useState } from 'react';

interface ICollectionTagFormProps {
  members: ICollectionParticipant[];
}

/**
 * Form for creating tags within a collection and managing access
 *
 * @param {ICollectionTagFormProps} props
 * @returns
 */
export const CollectionTagForm = (props: ICollectionTagFormProps) => {
  const { members } = props;
  const { setFieldValue, values } = useFormikContext<ICreateCollectionRequest>();

  const [allowedUsers, setAllowedUsers] = useState<number[]>([]);

  useEffect(() => {
    // Initially populate the allowedUsers based on the existing participants in form values
    const existingParticipants = values.participants.map((participant) => participant.system_user_id);
    setAllowedUsers(existingParticipants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members]);

  const handleToggle = (systemUserId: number) => {
    const isCurrentlyAllowed = allowedUsers.includes(systemUserId);

    // Update allowedUsers array
    const newAllowedUsers = isCurrentlyAllowed
      ? allowedUsers.filter((id) => id !== systemUserId) // Remove user if toggled off
      : [...allowedUsers, systemUserId]; // Add user if toggled on

    setAllowedUsers(newAllowedUsers);

    // Update the participants array in Formik state
    const updatedParticipants = members
      .filter((member) => newAllowedUsers.includes(member.system_user_id)) // Get only the allowed users
      .map((member) => ({
        system_user_id: member.system_user_id,
        collection_role_name: COLLECTION_ROLE.MEMBER // You can change this to any appropriate role
      }));

    // Update the participants field in Formik
    setFieldValue('participants', updatedParticipants);
  };

  // Select All / Deselect All functionality
  const handleSelectAll = () => {
    if (allowedUsers.length === members.length) {
      // If all users are already selected, unselect all
      setAllowedUsers([]);
    } else {
      // Otherwise, select all users
      const allUserIds = members.map((member) => member.system_user_id);
      setAllowedUsers(allUserIds);
    }

    // Update participants in Formik
    const updatedParticipants = members
      .filter((member) => allowedUsers.includes(member.system_user_id))
      .map((member) => ({
        system_user_id: member.system_user_id,
        collection_role_name: COLLECTION_ROLE.MEMBER // Change this as needed
      }));
    setFieldValue('participants', updatedParticipants);
  };

  const checkboxSelectedIds = allowedUsers;
  const samplingSiteCount = members.length;

  return (
    <>
      <GeneralInformationCollectionForm />
      <form>
        {/* Select All checkbox */}
        <FormGroup>
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 4, mb: 2 }}>
            <Typography fontWeight={700}>Select Who Has Access</Typography>
            <FormControl sx={{ pr: 1 }}>
              <Checkbox
                checked={checkboxSelectedIds.length > 0 && checkboxSelectedIds.length === samplingSiteCount}
                indeterminate={checkboxSelectedIds.length >= 1 && checkboxSelectedIds.length < samplingSiteCount}
                onClick={handleSelectAll}
                inputProps={{ 'aria-label': 'controlled' }}
              />
            </FormControl>
          </Box>
        </FormGroup>

        {/* List of users with checkboxes */}
        <List>
          {members.map((member) => {
            const isAllowed = allowedUsers.includes(member.system_user_id);

            return (
              <ListItem key={member.system_user_id} sx={{ pt: 0, pl: 1, mr: 0, pr: 1 }}>
                <ListItemText primary={member.display_name} secondary={`${member.email ?? 'No email'}`} />
                <FormControl>
                  <Checkbox checked={isAllowed} onChange={() => handleToggle(member.system_user_id)} color="primary" />
                </FormControl>
              </ListItem>
            );
          })}
        </List>
      </form>
    </>
  );
};
