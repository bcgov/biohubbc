import { Color } from '@mui/material';
import Chip, { ChipProps } from '@mui/material/Chip';
import { ReactElement } from 'react';

interface IColouredRectangleChipProps extends ChipProps {
  colour: string | Color; // Accepts both hex code and MUI Color
  label: string | ReactElement;
}

/**
 * Returns a stylized MUI chip of a specified colour
 *
 * @param props {IColouredRectangleChipProps}
 * @returns
 */
const ColouredRectangleChip = (props: IColouredRectangleChipProps) => {
  const { colour, label, ...restProps } = props;

  // Determine if the `colour` is a hex code or a Color object
  const isHex = typeof colour === 'string';

  return (
    <Chip
      size="small"
      label={label}
      {...restProps}
      sx={{
        bgcolor: isHex ? colour : colour[50],
        borderRadius: '5px',
        minWidth: 0,
        '& .MuiChip-label': {
          color: isHex ? '#fff' : colour[700],
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
