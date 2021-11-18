import Box from '@material-ui/core/Box';
import Button, { ButtonProps } from '@material-ui/core/Button';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import React, { ReactNode, useState } from 'react';

export interface ICustomButtonProps {
  buttonLabel: string;
  buttonTitle: string;
  buttonOnClick: () => void;
  buttonStartIcon: ReactNode;
  buttonEndIcon?: ReactNode;
  buttonProps?: Partial<ButtonProps>;
}

export interface IButtonToolbarProps extends ICustomButtonProps, IActionToolbarProps {}

export const H3ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const id = `h3-button-toolbar-${props.buttonLabel.replace(/\s/g, '')}`;

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h3' }} toolbarProps={props.toolbarProps}>
      <Button
        id={id}
        data-testid={id}
        variant="text"
        color="primary"
        className="sectionHeaderButton"
        title={props.buttonTitle}
        aria-label={props.buttonTitle}
        startIcon={props.buttonStartIcon}
        endIcon={props.buttonEndIcon}
        onClick={() => props.buttonOnClick()}
        {...props.buttonProps}>
        {props.buttonLabel}
      </Button>
    </ActionToolbar>
  );
};

export const H2ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const id = `h2-button-toolbar-${props.buttonLabel.replace(/\s/g, '')}`;

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h2' }} toolbarProps={props.toolbarProps}>
      <Button
        id={id}
        data-testid={id}
        variant="outlined"
        color="primary"
        title={props.buttonTitle}
        aria-label={props.buttonTitle}
        startIcon={props.buttonStartIcon}
        endIcon={props.buttonEndIcon}
        onClick={() => props.buttonOnClick()}
        {...props.buttonProps}>
        {props.buttonLabel}
      </Button>
    </ActionToolbar>
  );
};

export interface IMenuToolbarItem {
  menuIcon?: ReactNode;
  menuLabel: string;
  menuOnClick: () => void;
}

export interface IMenuToolbarProps extends ICustomMenuButtonProps, IActionToolbarProps {}

export const H2MenuToolbar: React.FC<IMenuToolbarProps> = (props) => {
  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h2' }} toolbarProps={props.toolbarProps}>
      <CustomMenuButton {...props} />
    </ActionToolbar>
  );
};

export interface ICustomMenuButtonProps {
  buttonLabel?: string;
  buttonTitle?: string;
  buttonStartIcon?: ReactNode;
  buttonEndIcon?: ReactNode;
  buttonProps?: Partial<ButtonProps>;
  menuItems: IMenuToolbarItem[];
}

export const CustomMenuButton: React.FC<ICustomMenuButtonProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const id = `h2-menu-toolbar-${props.buttonLabel?.replace(/\s/g, '') || 'button'}`;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const closeMenuOnItemClick = (menuItemOnClick: () => void) => {
    setAnchorEl(null);
    menuItemOnClick();
  };

  return (
    <>
      <Button
        color="primary"
        variant="outlined"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={props.buttonStartIcon}
        endIcon={props.buttonEndIcon}
        onClick={handleClick}
        {...props.buttonProps}>
        {props.buttonLabel}
      </Button>
      <Menu
        id={id}
        data-testid={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        {props.menuItems.map((menuItem) => {
          const id = `h2-menu-toolbar-item-${menuItem.menuLabel.replace(/\s/g, '')}`;
          return (
            <MenuItem id={id} data-testid={id} onClick={() => closeMenuOnItemClick(menuItem.menuOnClick)}>
              <ListItemIcon>{menuItem.menuIcon}</ListItemIcon>
              {menuItem.menuLabel}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export interface ICustomMenuIconButtonProps {
  buttonTitle?: string;
  buttonIcon: ReactNode;
  buttonProps?: Partial<IconButtonProps>;
  menuItems: IMenuToolbarItem[];
}

export const CustomMenuIconButton: React.FC<ICustomMenuIconButtonProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const id = `h2-menu-toolbar-${props.buttonTitle?.replace(/\s/g, '') || 'button'}`;

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const closeMenuOnItemClick = (menuItemOnClick: () => void) => {
    setAnchorEl(null);
    menuItemOnClick();
  };

  return (
    <>
      <IconButton
        color="primary"
        aria-label="icon button menu"
        onClick={handleClick}
        data-testid="icon-action-menu"
        aria-controls="basic-icon-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}>
        {props.buttonIcon}
      </IconButton>
      <Menu
        id={id}
        data-testid={id}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        MenuListProps={{
          'aria-labelledby': 'basic-button'
        }}>
        {props.menuItems.map((menuItem) => {
          const id = `h2-menu-toolbar-item-${menuItem.menuLabel.replace(/\s/g, '')}`;
          return (
            <MenuItem id={id} data-testid={id} onClick={() => closeMenuOnItemClick(menuItem.menuOnClick)}>
              <ListItemIcon>{menuItem.menuIcon}</ListItemIcon>
              {menuItem.menuLabel}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

interface IActionToolbarProps {
  label: string;
  labelProps?: Partial<TypographyProps<'div'>>;
  toolbarProps?: Partial<ToolbarProps>;
}

const ActionToolbar: React.FC<IActionToolbarProps> = (props) => {
  return (
    <Toolbar {...props.toolbarProps} style={{ justifyContent: 'space-between' }}>
      <Typography {...props.labelProps} color="inherit">
        {props.label}
      </Typography>
      <Box>{props.children}</Box>
    </Toolbar>
  );
};
