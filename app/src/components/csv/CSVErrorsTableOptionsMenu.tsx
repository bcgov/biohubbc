import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';

interface CSVErrorsTableOptionsMenuProps {
  options: string[];
}

/**
 * Renders a CSV errors table options menu.
 *
 * @param {CSVErrorsTableOptionsMenuProps} props
 * @returns {*} {JSX.Element}
 */
export const CSVErrorsTableOptionsMenu = (props: CSVErrorsTableOptionsMenuProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Button
        onClick={(event) => setAnchorEl(event.currentTarget)}
        size="small"
        variant="outlined"
        endIcon={<Icon path={mdiChevronDown} size={0.8} />}>
        View
      </Button>
      <Menu open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={() => setAnchorEl(null)}>
        {props.options.map((value) => (
          <MenuItem key={`csv-error-option-${value}`}>{value}</MenuItem>
        ))}
      </Menu>
    </>
  );
};
