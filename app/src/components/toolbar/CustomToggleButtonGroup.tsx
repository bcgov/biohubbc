import { mdiDotsVertical, mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Checkbox } from '@mui/material';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { useState } from 'react';
import appTheme from 'themes/appTheme';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  checkbox?: boolean;
  indeterminate?: boolean;
  checked?: boolean;
  disabled?: boolean;
  menu?: {
    label: string;
    onClick: () => void;
  }[];
}

interface CustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType;
  onViewChange: (view: ViewValueType) => void;
  handleCheckboxClick?: (view: ToggleButtonView<ViewValueType>) => void;
  orientation: 'horizontal' | 'vertical';
}

const CustomToggleButtonGroup = <ViewValueType extends string>(props: CustomToggleButtonGroupProps<ViewValueType>) => {
  const { views, activeView, onViewChange, orientation, handleCheckboxClick } = props;

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
            <ToggleButton
              key={view.value}
              value={view.value}
              color="primary"
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 1.5,
                '& .MuiIconButton-root': { p: 0.25 }
              }}>
              <Box display="flex" alignItems="center" gap={1} flexGrow={1} minWidth={0}>
                {startIcon}
                {view.label}
              </Box>

              {/* IconButton with Plus icon for disabled view */}
              {view.checkbox && view.disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 24,
                    height: 24
                  }}>
                  <CustomTooltip tooltip="Change sites to applicable">
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <IconButton
                        onClick={(e) => {
                          handleCheckboxClick?.(view);
                          e.stopPropagation();
                        }}
                        size="small"
                        sx={{
                          color: grey[400],
                          position: 'absolute',
                          display: 'flex',
                          p: 0
                        }}>
                        <Icon path={mdiPlus} size={1} />
                      </IconButton>
                    </Box>
                  </CustomTooltip>
                </Box>
              )}

              {/* Checkbox that switches to minus IconButton on hover */}
              {view.checkbox && !view.disabled && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 15,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 24,
                    height: 24
                  }}>
                  <CustomTooltip tooltip="Change sites to non-applicable">
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover .checkbox': { display: 'none' },
                        '&:hover .icon-button': { display: 'flex' }
                      }}>
                      <Checkbox
                        className="checkbox"
                        checked={view.checked}
                        indeterminate={view.indeterminate}
                        onClick={(e) => {
                          handleCheckboxClick?.(view);
                          e.stopPropagation();
                        }}
                        size="small"
                        sx={{
                          position: 'absolute',
                          p: 0,
                          '& .MuiSvgIcon-root': {
                            fill: appTheme.palette.primary.main
                          }
                        }}
                      />

                      <IconButton
                        className="icon-button"
                        onClick={(e) => {
                          handleCheckboxClick?.(view);
                          e.stopPropagation();
                        }}
                        size="small"
                        sx={{
                          color: grey[400],
                          position: 'absolute',
                          display: 'none',
                          p: 0
                        }}>
                        <Icon path={mdiMinus} size={1} />
                      </IconButton>
                    </Box>
                  </CustomTooltip>
                </Box>
              )}

              {/* Optional menu button */}
              {view.menu && view.menu.length > 0 && (
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
