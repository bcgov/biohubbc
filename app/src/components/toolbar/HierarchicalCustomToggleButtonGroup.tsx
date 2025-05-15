import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
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
  tooltip?: string;
  isHeader?: boolean;
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType | null;
  onViewChange: (view: ViewValueType) => void;
  orientation: 'horizontal' | 'vertical';
}

export const HierarchicalCustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation
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

      const content = (
        <Box key={item.value} sx={{ ml: `${level * 25}px`, my: 0.5 }}>
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
              endIcon={
                hasChildren ? (
                  <Icon
                    path={expanded.has(item.value) ? mdiChevronDown : mdiChevronRight}
                    size={1}
                    style={{ marginLeft: 'auto' }}
                  />
                ) : undefined
              }
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                width: '100%',
                border: 'none !important',
                borderRadius: '4px !important',
                fontSize: '0.875rem',
                px: 2,
                py: 1
              }}>
              <Typography flex="1" textAlign="left" fontWeight={700} textTransform="capitalize">
                {item.label}
              </Typography>
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
    <ToggleButtonGroup orientation={orientation} value={activeView} exclusive sx={{ width: '100%' }}>
      {renderViews(views)}
    </ToggleButtonGroup>
  );
};
