import { Chip, ChipProps, Color, SxProps } from '@mui/material';

export interface IColouredRectangleChipProps extends ChipProps {
  colour: Color;
  label: string | JSX.Element;
  sx?: SxProps;
  strong?: boolean;
  inverse?: boolean;
}
/**
 * Styled chip for highlighting important information
 */
const ColouredRectangleChip = (props: IColouredRectangleChipProps) => {
  return (
    <Chip
      size="small"
      {...props}
      sx={{
        bgcolor: props.inverse ? props.colour[500] : props.strong ? props.colour[100] : props.colour[50],
        borderRadius: '5px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: props.inverse ? props.colour[100] : props.strong ? props.colour[800] : props.colour[600],
          fontWeight: 700,
          fontSize: '0.75rem',
          p: 1
        },
        ...props.sx
      }}
    />
  );
};

export default ColouredRectangleChip;
