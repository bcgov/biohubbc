import { mdiChevronDown, mdiChevronRight } from '@mdi/js'; // Add mdiChevronRight for collapsed state
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse'; // Use Collapse for expanding/collapsing
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
  isHeader?: boolean;
  isChecked?: boolean;
  disabled?: boolean;
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType | null;
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

      const content = (
        <Box key={item.value} sx={{ ml: `${level * 20}px`, my: 0.5, mt: level > 0 ? 0.5 : 0 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            <ToggleButton
              component={Button}
              color="primary"
              value={item.value}
              onClick={() => {
                if (item.isHeader || item.children?.length) {
                  toggleExpand(item.value);
                }
                if (!item.isHeader && !item.disabled) {
                  onViewChange(item.value);
                }
              }}
              endIcon={
                <Box
                  sx={{
                    position: 'relative',
                    height: 24,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}>
                  {/* Chevron Icon */}
                  {item.children && item.children?.length > 0 && (
                    <Box sx={{ position: 'absolute', right: item.checkbox ? '42px' : '8px', top: 0 }}>
                      <Icon path={expanded.has(item.value) ? mdiChevronDown : mdiChevronRight} size={1} />
                    </Box>
                  )}

                  {/* Checkbox */}
                  {item.checkbox && (
                    <Checkbox
                      disabled={item.disabled}
                      checked={item.isChecked}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckbox && handleCheckbox(item);
                      }}
                      size="small"
                      sx={{
                        position: 'absolute',
                        right: 0
                      }}
                    />
                  )}
                </Box>
              }
              disabled={item.disabled}
              sx={{
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
                mr: item.checkbox ? 4 : 0
              }}>
              <Typography flex="1 1 auto" textAlign="left" fontWeight={700} textTransform="capitalize">
                {item.label}
              </Typography>
            </ToggleButton>
          </CustomTooltip>
        </Box>
      );

      const children = hasChildren && (
        <Collapse in={expanded.has(item.value)} unmountOnExit>
          {renderViews(item.children!, level + 1)}
        </Collapse>
      );

      return children ? [content, children] : [content];
    });
  };

  // Render all views without altering their order
  const renderToggleButtonGroups = () => {
    return (
      <ToggleButtonGroup orientation={orientation} value={activeView} exclusive sx={{ width: '100%' }}>
        {renderViews(views)}
      </ToggleButtonGroup>
    );
  };

  return <>{renderToggleButtonGroups()}</>;
};
