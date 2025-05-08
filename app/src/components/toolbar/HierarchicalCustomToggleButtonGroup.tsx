import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
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

  const renderViews = (items: ToggleButtonView<ViewValueType>[], level = 0) => {
    return items.map((item) => {
      const isExpanded = expanded.has(item.value);
      const hasChildren = !!item.children?.length;

      // Render Header as non-interactive label
      if (item.isHeader && !item.children?.length) {
        return (
          <Box
            key={item.value}
            sx={{
              ml: `${level * 20}px`,
              my: 0.25,
              '&:not(:first-of-type)': {
                mt: 1 // add extra top padding to non-first headers
              }
            }}>
            <Typography
              color={grey[500]}
              sx={{
                textTransform: 'uppercase',
                fontWeight: 700,
                fontSize: '0.75rem',
                m: 1
              }}>
              {item.label}
            </Typography>
          </Box>
        );
      }

      return (
        <Box key={item.value} sx={{ ml: `${level * 20}px`, my: 0.5, mt: level > 0 ? 0.5 : 0 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            <ToggleButton
              component={Button}
              color="primary"
              value={item.value}
              onClick={() => {
                if (hasChildren) {
                  toggleExpand(item.value);
                }
                if (!item.disabled && !item.isHeader) {
                  onViewChange(item.value);
                }
              }}
              endIcon={
                item.checkbox && (
                  <Box sx={{ position: 'relative', height: 24 }}>
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
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        right: '-20px'
                      }}
                    />
                  </Box>
                )
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
                fontWeight: 700,
                letterSpacing: '0.02rem',
                '& .MuiTypography-root': {
                  mr: item.checkbox ? 4 : 0
                }
              }}>
              <Typography flex="1 1 auto" textAlign="left" fontWeight={700} textTransform="none">
                {item.label}
              </Typography>
            </ToggleButton>
          </CustomTooltip>

          {/* Render children inside a Collapse (only for items with children) */}
          {hasChildren && (
            <Collapse in={isExpanded} unmountOnExit>
              {renderViews(item.children!, level + 1)}
            </Collapse>
          )}
        </Box>
      );
    });
  };

  // Render all views without altering their order
  const renderToggleButtonGroups = () => {
    return (
      <ToggleButtonGroup key="all-items" orientation={orientation} value={activeView} exclusive sx={{ width: '100%' }}>
        {renderViews(views)} {/* Render all views directly */}
      </ToggleButtonGroup>
    );
  };

  return <>{renderToggleButtonGroups()}</>;
};
