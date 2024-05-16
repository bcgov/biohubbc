import Typography, { TypographyProps } from '@mui/material/Typography';

interface IScientificNameTypographyProps extends TypographyProps {
  name: string;
}

/**
 * Typography wrapper for formatting a species' scientific name. Returns an italicized Typography
 * component if the input name has 2 or more words.
 *
 * @param props
 * @returns
 */
const ScientificNameTypography = (props: IScientificNameTypographyProps) => {
  const terms = props.name.split(' ');

  if (terms.length > 1) {
    return (
      <Typography {...props}>
        <i>{props.name}</i>
      </Typography>
    );
  } else {
    return <Typography {...props}>{props.name}</Typography>;
  }
};

export default ScientificNameTypography;
