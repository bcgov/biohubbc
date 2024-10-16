import { Color } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';

export interface IColouredRectangleChipProps extends ChipProps {
  colour: Color;
  label: string | JSX.Element;
}

/**
 * Returns a stylized MUI chip of a specified colour
 *
 * @param props {IColouredRectangleChipProps}
 * @returns
 */
const ColouredRectangleChip = (props: IColouredRectangleChipProps) => {
  return (
    <Chip
      size="small"
      {...props}
      sx={{
        bgcolor: props.colour[50],
        borderRadius: '5px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: props.colour[700],
          fontWeight: 700,
          fontSize: '0.75rem',
          p: 1,
          textTransform: 'uppercase'
        },
        ...props.sx
      }}
    />
  );
};

export default ColouredRectangleChip;
