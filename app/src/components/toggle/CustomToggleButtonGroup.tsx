import { mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import { Checkbox } from '@mui/material';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import appTheme from 'themes/appTheme';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  checkbox?: boolean;
  checked?: boolean;
  disabled?: boolean;
  tooltip?: string;
  isHeader?: boolean;
  indeterminate?: boolean;
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
                  <CustomTooltip tooltip={`Include ${view.label} in the progress calculation`}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxClick?.(view);
                        }}
                        sx={{
                          position: 'absolute',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 30,
                          color: grey[400],
                          '&:hover': {
                            bgcolor: grey[300],
                            borderRadius: '500px'
                          }
                        }}>
                        <Icon path={mdiPlus} size={1} />
                      </Box>
                    </Box>
                  </CustomTooltip>
                </Box>
              )}

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
                  <CustomTooltip tooltip={`Remove ${view.label} from the progress calculation`}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        '&:hover .checkbox': {
                          opacity: 0
                        },
                        '&:hover .minus-icon': {
                          opacity: 1
                        }
                      }}>
                      <Checkbox
                        className="checkbox"
                        checked={view.checked}
                        indeterminate={view.indeterminate}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxClick?.(view);
                        }}
                        size="small"
                        sx={{
                          position: 'absolute',
                          p: 0,

                          opacity: 1,
                          '& .MuiSvgIcon-root': {
                            fill: appTheme.palette.primary.main
                          }
                        }}
                      />

                      <Box
                        className="minus-icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxClick?.(view);
                        }}
                        sx={{
                          position: 'absolute',
                          opacity: 0,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 30,
                          height: 30,
                          color: grey[400],
                          '&:hover': {
                            bgcolor: grey[300],
                            borderRadius: '500px'
                          }
                        }}>
                        <Icon path={mdiMinus} size={1} />
                      </Box>
                    </Box>
                  </CustomTooltip>
                </Box>
              )}
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </>
  );
};

export default CustomToggleButtonGroup;
