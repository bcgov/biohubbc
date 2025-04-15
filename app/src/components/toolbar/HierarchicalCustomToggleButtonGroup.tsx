import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { useCallback, useEffect, useState } from 'react';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  children?: ToggleButtonView<ViewValueType>[];
  checkbox?: boolean;
  tooltip?: string;
  isHeading?: boolean;
  disabled?: boolean;
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType;
  onViewChange: (view: ViewValueType) => void;
  orientation: 'horizontal' | 'vertical';
  handleCheckbox?: (view: ToggleButtonView<ViewValueType>) => void;
}

export const HierarchicalCustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation,
  handleCheckbox
}: HierarchicalCustomToggleButtonGroupProps<ViewValueType>) => {
  const [expanded, setExpanded] = useState<Set<ViewValueType>>(new Set());

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
    const parents = findParentViews(views, activeView);
    setExpanded((prev) => new Set([...prev, ...parents]));
  }, [activeView, views, findParentViews]);

  const toggleExpand = (value: ViewValueType) => {
    setExpanded((prev) => {
      const updated = new Set(prev);
      updated.has(value) ? updated.delete(value) : updated.add(value);
      return new Set(updated);
    });
  };

  const hasActiveDescendant = (item: ToggleButtonView<ViewValueType>): boolean => {
    if (!item.children) {
      return false;
    }
    return item.children.some((child) => child.value === activeView || hasActiveDescendant(child));
  };

  const renderViews = (items: ToggleButtonView<ViewValueType>[], level = 0) => {
    return items.map((item) => {
      const isExpanded = expanded.has(item.value);
      const hasChildren = !!item.children?.length;
      const showHighlight = item.value === activeView || hasActiveDescendant(item);

      return (
        <Box key={item.value} sx={{ ml: level * 1.5, mt: level > 0 ? 0.25 : 0 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            <ToggleButton
              component={Button}
              color="primary"
              value={item.value}
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(item.value);
                }
                if (!item.isHeading && !item.disabled) {
                  onViewChange(item.value);
                }
              }}
              startIcon={
                item.checkbox && handleCheckbox ? (
                  <Checkbox
                    disabled={item.disabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckbox(item);
                    }}
                    size="small"
                  />
                ) : undefined
              }
              endIcon={hasChildren ? <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} /> : undefined}
              disabled={false}
              sx={{
                backgroundColor: showHighlight ? (theme) => theme.palette.grey[50] : 'transparent'
              }}>
              {item.label}
            </ToggleButton>
          </CustomTooltip>

          {hasChildren && (
            <Collapse in={isExpanded} unmountOnExit>
              {renderViews(item.children!, level + 1)}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  return (
    <ToggleButtonGroup
      orientation={orientation}
      value={activeView}
      exclusive
      sx={{
        display: 'flex',
        flexDirection: orientation === 'vertical' ? 'column' : 'row',
        gap: 0.5,
        '& Button': {
          py: 1,
          width: '100%',
          px: 2,
          border: 'none',
          borderRadius: '4px !important',
          fontSize: '0.875rem',
          fontWeight: 700,
          letterSpacing: '0.02rem',
          justifyContent: 'flex-start'
        }
      }}>
      {renderViews(views)}
    </ToggleButtonGroup>
  );
};
