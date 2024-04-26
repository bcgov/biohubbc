import Typography, { TypographyProps } from '@mui/material/Typography';

interface IScientificNameTypographyProps extends TypographyProps {
  name: string;
}
const ScientificNameTypography = (props: IScientificNameTypographyProps) => {
  const terms = props.name.split(' ');

  if (terms.length > 1) {
    return (
      <Typography {...props}>
        <i>{props.name}</i>
      </Typography>
    );
  } else {
    return (
      <Typography {...props}>
        {props.name}
      </Typography>
    );
  }
};

export default ScientificNameTypography;
