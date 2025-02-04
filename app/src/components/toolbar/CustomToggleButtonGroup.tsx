import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useState } from 'react';

export interface ToggleButtonView<ViewValueType> {
  value: ViewValueType;
  label: string;
  icon?: string;
  children?: ToggleButtonView<ViewValueType>[];
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
  const [expanded, setExpanded] = useState<Set<ViewValueType>>(new Set());

  const toggleExpand = (view: ViewValueType) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(view)) {
        newSet.delete(view);
      } else {
        newSet.add(view);
      }
      return newSet;
    });
  };

  const renderViews = (views: ToggleButtonView<ViewValueType>[], level = 0) => {
    return views.map((view) => {
      const startIcon = view.icon ? <Icon path={view.icon} size={0.75} /> : undefined;
      const hasChildren = view.children && view.children.length > 0;
      const isExpanded = expanded.has(view.value);

      return (
        <Box key={view.value} sx={{ marginLeft: level * 2, mt: level > 0 ? 0.5 : 0 }}>
          <ToggleButton
            component={Button}
            color="primary"
            startIcon={startIcon}
            endIcon={hasChildren && <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} />}
            value={view.value}
            onClick={() => {
              onViewChange(view.value);
              if (hasChildren) toggleExpand(view.value);
            }}>
            {view.label}
          </ToggleButton>

          {hasChildren && isExpanded && renderViews(view.children ?? [], level + 1)}
        </Box>
      );
    });
  };

  return (
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

export default CustomToggleButtonGroup;
