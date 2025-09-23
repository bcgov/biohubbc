import { mdiMagnify } from '@mdi/js';
import Icon from '@mdi/react';
import { InputAdornment, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { useState } from 'react';
import { CollectionMembers } from './participant/CollectionParticipants';

interface ICollectionAboutProps {
  collection: ICollection;
}
/**
 * Project details content for a project.
 *
 * @return {*}
 */
const CollectionAbout = (props: ICollectionAboutProps) => {
  const { collection } = props;

  const [members, setmembers] = useState(collection.members);

  return (
    <Box>
      <Toolbar>
        <Typography variant="h4" component="h2" flex="1 1 auto" mt={1}>
          Overview
        </Typography>
      </Toolbar>
      <Box px={3} mb={3}>
        <Box component="section">
          <Typography color="textSecondary">{collection.description}</Typography>
        </Box>
        <Box component="section" mt={3}>
          <Typography
            sx={{
              mb: 2,
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02rem',
              textTransform: 'uppercase'
            }}>
            Members
          </Typography>
          <TextField
            sx={{ mb: 2 }}
            fullWidth
            InputProps={{
              endAdornment: (
                <InputAdornment position="start">
                  <Icon path={mdiMagnify} size={1} color={grey[500]} />
                </InputAdornment>
              )
            }}
            label="Search Members"
            placeholder="Type a name"
            onChange={(e) => {
              if (!e.currentTarget.value) {
                setmembers(collection.members);
              }
              setmembers(
                collection.members.filter((member) => member.display_name.toLowerCase().includes(e.currentTarget.value))
              );
            }}
          />
          <CollectionMembers members={members} />
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionAbout;
