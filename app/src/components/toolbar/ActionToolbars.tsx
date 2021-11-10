import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Toolbar, { ToolbarProps } from '@material-ui/core/Toolbar';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import { mdiMenuDown } from '@mdi/js';
import Icon from '@mdi/react';
import React, { ReactNode, useState } from 'react';

export interface IButtonToolbarProps extends IActionToolbarProps {
  buttonLabel: string;
  buttonTitle: string;
  buttonOnClick: () => void;
  buttonStartIcon: ReactNode;
}

export const H3ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const id = `h3-button-toolbar-${props.buttonLabel.replaceAll(/\s/g, '')}`;

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h3' }}>
      <Button
        id={id}
        data-testid={id}
        variant="text"
        color="primary"
        className="sectionHeaderButton"
        title={props.buttonTitle}
        aria-label={props.buttonTitle}
        startIcon={props.buttonStartIcon}
        onClick={() => props.buttonOnClick()}>
        {props.buttonLabel}
      </Button>
    </ActionToolbar>
  );
};

export const H2ButtonToolbar: React.FC<IButtonToolbarProps> = (props) => {
  const id = `h2-button-toolbar-${props.buttonLabel.replaceAll(/\s/g, '')}`;

  return (
    <ActionToolbar label={props.label} labelProps={{ variant: 'h2' }}>
      <Button
        id={id}
        data-testid={id}
        variant="outlined"
        color="primary"
        title={props.buttonTitle}
        aria-label={props.buttonTitle}
        startIcon={props.buttonStartIcon}
        onClick={() => props.buttonOnClick()}>
        {props.buttonLabel}
      </Button>
    </ActionToolbar>
  );
};

export interface IMenuToolbarItem {
  menuLabel: string;
  menuOnClick: () => void;
}

export interface IMenuToolbarProps extends IActionToolbarProps {
  buttonLabel: string;
  buttonTitle: string;
  buttonStartIcon: ReactNode;
  menuItems: IMenuToolbarItem[];
}

export const H2MenuToolbar: React.FC<IMenuToolbarProps> = (props) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const open = Boolean(anchorEl);

  const id = `h2-menu-toolbar-${props.buttonLabel.replaceAll(/\s/g, '')}`;

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
    <ActionToolbar label={props.label} labelProps={{ variant: 'h2' }}>
      <Button
        color="primary"
        variant="outlined"
        aria-controls="basic-menu"
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        startIcon={props.buttonStartIcon}
        endIcon={<Icon path={mdiMenuDown} size={1} />}
        onClick={handleClick}>
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
          const id = `h2-menu-toolbar-item-${menuItem.menuLabel.replaceAll(/\s/g, '')}`;
          return (
            <MenuItem id={id} data-testid={id} onClick={() => closeMenuOnItemClick(menuItem.menuOnClick)}>
              {menuItem.menuLabel}
            </MenuItem>
          );
        })}
      </Menu>
    </ActionToolbar>
  );
};

interface IActionToolbarProps {
  label: string;
  labelProps?: Partial<TypographyProps<'div'>>;
  toolbarProps?: Partial<ToolbarProps>;
}

const ActionToolbar: React.FC<IActionToolbarProps> = (props) => {
  return (
    <Toolbar {...props.toolbarProps} style={{ justifyContent: 'space-between', paddingLeft: '16px', paddingRight: '16px' }}>
      <Typography {...props.labelProps} color="inherit">
        {props.label}
      </Typography>
      <Box>{props.children}</Box>
    </Toolbar>
  );
};
