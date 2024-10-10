import { Color } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import { ReactElement } from 'react';

export interface IColouredRectangleChipProps extends ChipProps {
  colour: Color;
  label: string | ReactElement;
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
          textTransform: 'uppercase',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        ...props.sx
      }}
    />
  );
};

export default ColouredRectangleChip;
