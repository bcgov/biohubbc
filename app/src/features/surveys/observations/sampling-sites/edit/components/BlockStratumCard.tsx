import { Box, Typography } from '@mui/material';

interface IBlockStratumCard {
  label: string;
  description: string;
}

const BlockStratumCard: React.FC<IBlockStratumCard> = (props) => {
  return (
    <Box>
      <Box>
        <Typography variant="subtitle1" fontWeight="bold">
          {props.label}
        </Typography>
      </Box>
      <Box my={0.25}>
        <Typography variant="subtitle2" color="textSecondary">
          {props.description}
        </Typography>
      </Box>
    </Box>
  );
};

export default BlockStratumCard;