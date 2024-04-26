import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';

interface IAnimalAttributeItemProps {
  startIcon?: string;
  text: string | JSX.Element;
}

const AnimalAttributeItem = (props: IAnimalAttributeItemProps) => {
  return (
    <Box display="flex" alignItems="center">
      {props.startIcon && <Icon path={props.startIcon} size={0.8} color={grey[500]} />}
      <Typography variant="body1" color="textSecondary" sx={{ ml: 0.5 }}>
        {props.text}
      </Typography>
    </Box>
  );
};

export default AnimalAttributeItem;
