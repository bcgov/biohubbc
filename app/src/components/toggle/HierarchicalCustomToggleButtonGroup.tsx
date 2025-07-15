import { mdiChevronDown, mdiChevronRight, mdiMinus, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { useCallback, useEffect, useMemo, useState } from 'react';
import appTheme from 'themes/appTheme';

interface ToggleButtonView<ViewValueType> {
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

export interface HierarchicalToggleButtonView<ViewValueType> extends ToggleButtonView<ViewValueType> {
  children?: HierarchicalToggleButtonView<ViewValueType>[];
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  views: HierarchicalToggleButtonView<ViewValueType>[];
  activeView: ViewValueType | null;
  onViewChange: (view: ViewValueType) => void;
  handleCheckboxClick?: (view: HierarchicalToggleButtonView<ViewValueType>) => void;
  orientation: 'horizontal' | 'vertical';
  fixedExpanded?: boolean;
}

export const HierarchicalCustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation,
  handleCheckboxClick,
  fixedExpanded
}: HierarchicalCustomToggleButtonGroupProps<ViewValueType>) => {
  const [expanded, setExpanded] = useState<Set<ViewValueType>>(new Set());

  const fullyExpandedViews = useMemo(() => {
    if (!fixedExpanded) {
      return new Set<ViewValueType>();
    }

    const collectAll = (items: HierarchicalToggleButtonView<ViewValueType>[], acc: ViewValueType[] = []) => {
      for (const item of items) {
        acc.push(item.value);
        if (item.children?.length) {
          collectAll(item.children, acc);
        }
      }
      return acc;
    };

    // If some items are initially expanded, still update the setExpanded after initial mount to trigger the animation
    return new Set(collectAll(views));
  }, [fixedExpanded, views]);

  useEffect(() => {
    setExpanded(fullyExpandedViews);
  }, [fullyExpandedViews]);

  const toggleExpand = (value: ViewValueType) => {
    setExpanded((prev) => {
      const updated = new Set(prev);
      updated.has(value) ? updated.delete(value) : updated.add(value);
      return updated;
    });
  };

  const findParentViews = useCallback(
    (
      items: HierarchicalToggleButtonView<ViewValueType>[],
      target: ViewValueType,
      parents: Set<ViewValueType> = new Set()
    ): Set<ViewValueType> => {
      for (const item of items) {
        if (item.value === target) {
          return parents;
        }
        if (item.children) {
          const found = findParentViews(item.children, target, new Set([...parents, item.value]));
          if (found.size) {
            return found;
          }
        }
      }
      return new Set();
    },
    []
  );

  useEffect(() => {
    if (activeView) {
      const parents = findParentViews(views, activeView);
      setExpanded((prev) => new Set([...prev, ...parents]));
    }
  }, [activeView, views, findParentViews]);

  const renderViews = (items: HierarchicalToggleButtonView<ViewValueType>[], level = 0): JSX.Element[] => {
    return items.flatMap((item) => {
      const hasChildren = !!item.children?.length;
      const startIcon = item.icon && <Icon path={item.icon} size={0.75} />;

      const content = (
        <Box key={item.value} sx={{ ml: `${level * 25}px`, pb: 0.25 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            <ToggleButton
              component={Button}
              color="primary"
              value={item.value}
              onClick={() => {
                if (item.isHeader || hasChildren) {
                  toggleExpand(item.value);
                }
                if (!item.isHeader) {
                  onViewChange(item.value);
                }
              }}
              startIcon={startIcon}
              endIcon={
                <>
                  {/* IconButton with Plus icon for disabled view */}
                  {item.checkbox && item.disabled && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 24,
                        height: 24
                      }}>
                      <CustomTooltip tooltip={`Include ${item.label} in the progress calculation`}>
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
                              handleCheckboxClick?.(item);
                            }}
                            sx={{
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
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

                  {item.checkbox && !item.disabled && (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 15,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 24,
                        height: 24
                      }}>
                      <CustomTooltip tooltip={`Remove ${item.label} from the progress calculation`}>
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
                            checked={item.checked}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckboxClick?.(item);
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
                              handleCheckboxClick?.(item);
                            }}
                            sx={{
                              position: 'absolute',
                              opacity: 0,

                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 24,
                              height: 24,
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

                  {hasChildren && (
                    <Icon
                      path={expanded.has(item.value) ? mdiChevronDown : mdiChevronRight}
                      size={1}
                      style={{ marginLeft: 'auto', color: grey[500] }}
                    />
                  )}
                </>
              }
              sx={{
                display: 'flex',
                position: 'relative',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
                '& .MuiIconButton-root': { p: 0.25 }
              }}>
              <Box display="flex" alignItems="center" gap={1} flexGrow={1} minWidth={0}>
                {item.label}
              </Box>
            </ToggleButton>
          </CustomTooltip>
        </Box>
      );

      const children = hasChildren && (
        <Collapse key={`${item.value}-children`} in={expanded.has(item.value)} unmountOnExit>
          {renderViews(item.children!, level + 1)}
        </Collapse>
      );

      return children ? [content, children] : [content];
    });
  };

  return (
    <ToggleButtonGroup
      orientation={orientation}
      value={activeView}
      exclusive
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        gap: 0.5,
        '& Button': {
          py: 1.5,
          px: 2.5,
          border: 'none !important',
          borderRadius: '4px !important',
          fontSize: '0.8rem',
          fontWeight: 700,
          letterSpacing: '0.02rem',
          justifyContent: orientation === 'horizontal' ? 'center' : 'flex-start'
        }
      }}>
      {renderViews(views)}
    </ToggleButtonGroup>
  );
};
