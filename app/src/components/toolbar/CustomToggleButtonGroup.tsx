import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  menu?: {
    label: string;
    onClick: () => void;
  }[];
}

interface CustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType;
  onViewChange: (view: ViewValueType) => void;
  orientation: 'horizontal' | 'vertical';
}

const CustomToggleButtonGroup = <ViewValueType extends string>(props: CustomToggleButtonGroupProps<ViewValueType>) => {
  const { views, activeView, onViewChange, orientation } = props;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItems, setMenuItems] = useState<{ label: string; onClick: () => void }[]>([]);

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>, items: typeof menuItems) => {
    event.stopPropagation(); // Prevent toggle activation
    setAnchorEl(event.currentTarget);
    setMenuItems(items);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuItems([]);
  };

  return (
    <>
      <ToggleButtonGroup
        orientation={orientation}
        value={activeView}
        onChange={(_, view) => {
          if (view) {
            onViewChange(view);
          }
        }}
        exclusive
        sx={{
          display: 'flex',
          flex: '1 1 auto',
          gap: 0.5,
          '& Button': {
            py: 1,
            px: 2,
            border: 'none',
            borderRadius: '4px !important',
            fontSize: '0.8rem',
            fontWeight: 700,
            letterSpacing: '0.02rem',
            justifyContent: orientation === 'horizontal' ? 'center' : 'flex-start'
          }
        }}>
        {views.map((view) => {
          const startIcon = view.icon && <Icon path={view.icon} size={0.75} />;

          return (
            <ToggleButton
              key={view.value}
              value={view.value}
              color="primary"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                py: 1,
                '& .MuiIconButton-root': { p: 0.25 }
              }}>
              <Box display="flex" alignItems="center" gap={1} flexGrow={1} minWidth={0}>
                {startIcon}
                {view.label}
              </Box>

              {view.menu?.length && view.menu.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenMenu(e, view.menu!)}
                  sx={{
                    p: '2px',
                    m: 0,
                    ml: 1,
                    '& svg': {
                      display: 'block'
                    }
                  }}>
                  <Icon path={mdiDotsVertical} size={0.75} />
                </IconButton>
              )}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>

      {Boolean(anchorEl) && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                handleCloseMenu();
                item.onClick();
              }}>
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </>
  );
};

export default CustomToggleButtonGroup;
