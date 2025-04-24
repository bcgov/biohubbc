import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { ICollection } from 'interfaces/useCollectionApi.interface';
import { CollectionParticipants } from './participant/CollectionParticipants';

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
              fontSize: '14px',
              fontWeight: 700,
              letterSpacing: '0.02rem',
              textTransform: 'uppercase'
            }}>
            Members
          </Typography>
          <CollectionParticipants participants={collection.participants} />
        </Box>
      </Box>
    </Box>
  );
};

export default CollectionAbout;
