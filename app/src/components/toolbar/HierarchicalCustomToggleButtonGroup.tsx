import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { useCallback, useEffect, useState } from 'react';
import appTheme from 'themes/appTheme';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  checkbox?: boolean;
  isChecked?: boolean;
  disabled?: boolean;
  children?: ToggleButtonView<ViewValueType>[];
  tooltip?: string;
  isHeader?: boolean;
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType | null;
  onViewChange: (view: ViewValueType) => void;
  handleCheckboxClick?: (view: ToggleButtonView<ViewValueType>) => void;
  orientation: 'horizontal' | 'vertical';
}

export const HierarchicalCustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation,
  handleCheckboxClick
}: HierarchicalCustomToggleButtonGroupProps<ViewValueType>) => {
  const [expanded, setExpanded] = useState<Set<ViewValueType>>(new Set());

  const toggleExpand = (value: ViewValueType) => {
    setExpanded((prev) => {
      const updated = new Set(prev);
      updated.has(value) ? updated.delete(value) : updated.add(value);
      return updated;
    });
  };

  const findParentViews = useCallback(
    (
      items: ToggleButtonView<ViewValueType>[],
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

  const renderViews = (items: ToggleButtonView<ViewValueType>[], level = 0): JSX.Element[] => {
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
                  {item.checkbox && (
                    <Box position="absolute" right={10} top={0} bottom={0} display="flex" alignItems="center">
                      <Checkbox
                        checked={item.isChecked}
                        onClick={(e) => {
                          handleCheckboxClick?.(item);
                          e.stopPropagation();
                        }}
                        size="small"
                        sx={{
                          p: 1,
                          '& .MuiSvgIcon-root': {
                            fill: item.disabled ? grey[300] : appTheme.palette.primary.main
                          }
                        }}
                      />
                    </Box>
                  )}
                  {hasChildren ? (
                    <Icon
                      path={expanded.has(item.value) ? mdiChevronDown : mdiChevronRight}
                      size={1}
                      style={{ marginLeft: 'auto' }}
                    />
                  ) : undefined}
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
          border: 'none',
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
