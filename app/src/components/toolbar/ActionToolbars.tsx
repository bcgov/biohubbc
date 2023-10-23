import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Button, { ButtonProps } from '@mui/material/Button';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar, { ToolbarProps } from '@mui/material/Toolbar';
import Typography, { TypographyProps } from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  actionBarButton: {
    letterSpacing: '0.02rem'
  }
}));

export interface ICustomButtonProps {
  buttonLabel: string;
  buttonTitle: string;
  buttonOnClick: () => void;
  buttonStartIcon: ReactNode;
  buttonEndIcon?: ReactNode;
  buttonProps?: Partial<ButtonProps> & { 'data-testid'?: string };
  renderButton?: (buttonProps: Partial<ButtonProps>) => React.ReactNode;
}

const defaultButtonProps = (props: ICustomButtonProps): Partial<ButtonProps> => ({
  color: 'primary',
  title: props.buttonTitle,
  'aria-label': props.buttonTitle,
  startIcon: props.buttonStartIcon,
  endIcon: props.buttonEndIcon,
  onClick: () => props.buttonOnClick(),
  children: props.buttonLabel
});

export interface IButtonToolbarProps extends ICustomButtonProps, IActionToolbarProps {}

export const H3ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const classes = useStyles();
  const id = `h3-button-toolbar-${props.buttonLabel.replace(/\s/g, '')}`;

  const buttonProps: Partial<ButtonProps> & { 'data-testid'?: string } = {
    id,
    'data-testid': id,
    variant: 'text',
    ...defaultButtonProps(props),
    ...props.buttonProps,
    className: clsx(classes.actionBarButton, props.buttonProps?.className)
  };

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h3' }} toolbarProps={props.toolbarProps}>
      {props.renderButton ? props.renderButton(buttonProps) : <Button {...buttonProps} />}
    </ActionToolbar>
  );
};

export const H2ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const classes = useStyles();
  const id = `h2-button-toolbar-${props.buttonLabel.replace(/\s/g, '')}`;

  const buttonProps: Partial<ButtonProps> & { 'data-testid'?: string } = {
    id,
    'data-testid': id,
    ...defaultButtonProps(props),
    ...props.buttonProps,
    className: clsx(classes.actionBarButton, props.buttonProps?.className)
  };

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h2' }} toolbarProps={props.toolbarProps}>
      {props.renderButton ? props.renderButton(buttonProps) : <Button {...buttonProps} />}
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
  buttonTitle: string;
  buttonStartIcon?: ReactNode;
  buttonEndIcon?: ReactNode;
  buttonVariant?: string;
  buttonProps?: Partial<ButtonProps> & { 'data-testid'?: string };
  renderButton?: (buttonProps: Partial<ButtonProps>) => React.ReactNode;
  menuItems: IMenuToolbarItem[];
}

export const CustomMenuButton: React.FC<ICustomMenuButtonProps> = (props) => {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const buttonId = `custom-menu-button-${props.buttonLabel?.replace(/\s/g, '') || 'button'}`;

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

  const buttonProps: Partial<ButtonProps> & { 'data-testid'?: string } = {
    id: buttonId,
    'data-testid': buttonId,
    title: props.buttonTitle,
    color: 'primary',
    variant: 'outlined',
    'aria-controls': 'basic-menu',
    'aria-haspopup': 'true',
    'aria-expanded': open ? 'true' : undefined,
    startIcon: props.buttonStartIcon,
    endIcon: props.buttonEndIcon,
    onClick: handleClick,
    children: props.buttonLabel,
    ...props.buttonProps,
    className: clsx(classes.actionBarButton, props.buttonProps?.className)
  };

  return (
    <>
      {props.renderButton ? props.renderButton(buttonProps) : <Button {...buttonProps} />}
      <Menu
        style={{ marginTop: '8px' }}
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
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
          const menuItemId = `custom-menu-button-item-${menuItem.menuLabel.replace(/\s/g, '')}`;
          return (
            <MenuItem
              id={menuItemId}
              key={menuItemId}
              data-testid={menuItemId}
              onClick={() => closeMenuOnItemClick(menuItem.menuOnClick)}>
              {menuItem.menuIcon && <ListItemIcon>{menuItem.menuIcon}</ListItemIcon>}
              {menuItem.menuLabel}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
};

export interface ICustomMenuIconButtonProps {
  buttonTitle: string;
  buttonIcon: ReactNode;
  buttonProps?: Partial<IconButtonProps>;
  menuItems: IMenuToolbarItem[];
}

export const CustomMenuIconButton: React.FC<ICustomMenuIconButtonProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const buttonId = `custom-menu-icon-${props.buttonTitle?.replace(/\s/g, '') || 'button'}`;

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
        id={buttonId}
        data-testid={buttonId}
        title={props.buttonTitle}
        aria-label="icon button menu"
        aria-controls="basic-icon-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}>
        {props.buttonIcon}
      </IconButton>
      <Menu
        open={open}
        onClose={handleClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
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
          const menuItemId = `custom-menu-icon-item-${menuItem.menuLabel.replace(/\s/g, '')}`;
          return (
            <MenuItem
              id={menuItemId}
              key={menuItemId}
              data-testid={menuItemId}
              onClick={() => closeMenuOnItemClick(menuItem.menuOnClick)}>
              {menuItem.menuIcon && <ListItemIcon>{menuItem.menuIcon}</ListItemIcon>}
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

const ActionToolbar: React.FC<React.PropsWithChildren<IActionToolbarProps>> = (props) => {
  return (
    <Toolbar {...props.toolbarProps} style={{ justifyContent: 'space-between' }}>
      <Typography {...props.labelProps} variant="h2">
        {props.label}
      </Typography>
      <Box>{props.children}</Box>
    </Toolbar>
  );
};
