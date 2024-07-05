import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface IVerticalKeyValuePairProps {
  label: string;
  value: string | number;
}

const VerticalKeyValuePair = (props: IVerticalKeyValuePairProps) => {
  return (
    <Box>
      <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
        {props.label}
      </Typography>
      <Typography component="dd" variant="body2">
        {props.value}
      </Typography>
    </Box>
  );
};

export default VerticalKeyValuePair;
