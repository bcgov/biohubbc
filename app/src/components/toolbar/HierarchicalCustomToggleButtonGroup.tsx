import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
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
  isChecked?: boolean;
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
      if (updated.has(value)) {
        updated.delete(value);
      } else {
        updated.add(value);
      }
      return updated;
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

      console.log(item.isChecked);

      return (
        <Box key={item.value} sx={{ ml: level * 1.5, mt: level > 0 ? 0.25 : 0 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            <ToggleButton
              component={Button}
              color="primary"
              value={item.value}
              onClick={() => {
                if (!item.isHeading && !item.disabled) {
                  onViewChange(item.value);
                }
              }}
              startIcon={
                item.checkbox && handleCheckbox ? (
                  <Checkbox
                    disabled={item.disabled}
                    checked={item.isChecked}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCheckbox(item);
                    }}
                    size="small"
                  />
                ) : undefined
              }
              endIcon={
                hasChildren ? (
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.value);
                    }}
                    size="small">
                    <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} />
                  </IconButton>
                ) : undefined
              }
              disabled={false}
              sx={{
                backgroundColor: showHighlight ? (theme) => theme.palette.grey[50] : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                px: 2,
                py: 1,
                width: '100%',
                flex: '1 1 auto',
                border: 'none',
                borderRadius: '4px !important',
                fontSize: '0.875rem',
                fontWeight: 700,
                letterSpacing: '0.02rem'
              }}>
              <Typography flex="1 1 auto" textAlign="left" fontWeight={700} textTransform="none">
                {item.label}
              </Typography>
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
    <ToggleButtonGroup orientation={orientation} value={activeView} exclusive sx={{ flex: '1 1 auto', width: '100%' }}>
      {renderViews(views)}
    </ToggleButtonGroup>
  );
};
