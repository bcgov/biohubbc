import { mdiChevronDown } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Menu, { MenuProps } from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { PropsWithChildren, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface IBreadcrumbNavButtonProps {
  menuItems: { label: string; to: string; icon?: string }[];
}

/**
 * Returns a button that opens a menu of router links when clicked
 *
 * @param {PropsWithChildren<IBreadcrumbNavButtonProps>} props
 * @returns {*}
 */
export const BreadcrumbNavButton = (props: PropsWithChildren<IBreadcrumbNavButtonProps>) => {
  const { menuItems, children } = props;

  // State for managing the menu
  const [anchorEl, setAnchorEl] = useState<MenuProps['anchorEl']>(null);

  // Handle menu opening
  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu closing
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            component={RouterLink}
            to={item.to}
            sx={{ fontSize: '0.85rem', fontWeight: 700, color: 'primary.main' }}
            onClick={() => {
              handleMenuClose();
            }}>
            {item.icon ? <Icon path={item.icon} size={0.8} style={{ marginRight: '10px' }} /> : null}
            {item.label}
          </MenuItem>
        ))}
      </Menu>

      <Button
        onClick={handleMenuClick}
        endIcon={<Icon path={mdiChevronDown} size={0.8} />}
        sx={{
          bgcolor: grey[100],
          px: 2,
          mx: 1,
          fontSize: '0.85rem',
          textTransform: 'none',
          fontWeight: 700
        }}>
        {children}
      </Button>
    </>
  );
};
