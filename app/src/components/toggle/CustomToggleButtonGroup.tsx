import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  tooltip?: string;
  isHeader?: boolean;
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

const CustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation
}: CustomToggleButtonGroupProps<ViewValueType>) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [activeMenuView, setActiveMenuView] = useState<ViewValueType | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, viewValue: ViewValueType) => {
    event.stopPropagation(); // prevent triggering toggle selection
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuView(viewValue);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuView(null);
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
            py: 1.5,
            px: 2,
            mb: 0.25,
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
            <Box key={view.value} position="relative">
              <ToggleButton
                value={view.value}
                color="primary"
                sx={{
                  position: 'relative',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  px: 1.5,
                  width: '100%',
                  '& .MuiIconButton-root': { p: 0.25 }
                }}>
                <Box display="flex" alignItems="center" gap={1} flexGrow={1} minWidth={0}>
                  {startIcon}
                  {view.label}
                </Box>

                {view.menu?.length && (
                  <IconButton
                    sx={{ ml: 1 }}
                    size="small"
                    onClick={(e) => handleMenuClick(e, view.value)}
                    onMouseDown={(e) => e.stopPropagation()} // prevent focus from going to ToggleButton
                  >
                    <Icon path={mdiDotsVertical} size={0.8} />
                  </IconButton>
                )}
              </ToggleButton>

              {activeMenuView === view.value && (
                <Menu
                  anchorEl={menuAnchorEl}
                  open={Boolean(menuAnchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  onClick={(e) => e.stopPropagation()} // prevent bubbling to ToggleButtonGroup
                >
                  {view.menu?.map((item, index) => (
                    <MenuItem
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        item.onClick();
                        handleMenuClose();
                      }}>
                      {item.label}
                    </MenuItem>
                  ))}
                </Menu>
              )}
            </Box>
          );
        })}
      </ToggleButtonGroup>
    </>
  );
};

export default CustomToggleButtonGroup;
