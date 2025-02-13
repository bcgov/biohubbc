import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useEffect, useState } from 'react';

export interface ToggleButtonView<ViewValueType> {
  /**
   * The value of the toggle button, which will be passed to the `onViewChange` callback.
   *
   * @type {ViewValueType}
   * @memberof ToggleButtonView
   */
  value: ViewValueType;
  /**
   * The label to display for the toggle button.
   *
   * @type {string}
   * @memberof ToggleButtonView
   */
  label: string;
  /**
   * An optional start icon.
   *
   * @type {string}
   * @memberof ToggleButtonView
   */
  icon?: string;
  /**
   * Optional children to display for a parent .
   *
   * @type {string}
   * @memberof ToggleButtonView
   */
  children?: ToggleButtonView<ViewValueType>[];
}

interface HierarchicalCustomToggleButtonGroupProps<ViewValueType extends string> {
  /**
   * An array of views to display in the toggle button group.
   *
   * @type {ToggleButtonView<ViewValueType>[]}
   * @memberof CustomToggleButtonGroupProps
   */
  views: ToggleButtonView<ViewValueType>[];
  /**
   * The currently active view.
   *
   * @type {ViewValueType}
   * @memberof CustomToggleButtonGroupProps
   */
  activeView: ViewValueType;
  /**
   * Callback fired when a toggle button is clicked.
   *
   * @memberof CustomToggleButtonGroupProps
   */
  onViewChange: (view: ViewValueType) => void;
  /**
   * The orientation of the toggle button group.
   *
   * @type {('horizontal' | 'vertical')}
   * @memberof CustomToggleButtonGroupProps
   */
  orientation: 'horizontal' | 'vertical';
}

/**
 * A custom toggle button group that allows users to select from multiple views, and that includes children.
 * Used when toggle buttons should be shown as children of other options.
 *
 * @template ViewValueType
 * @param {CustomToggleButtonGroupProps<ViewValueType>} props
 * @return {*}
 */
export const HierarchicalCustomToggleButtonGroup = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  orientation
}: HierarchicalCustomToggleButtonGroupProps<ViewValueType>) => {
  const [expanded, setExpanded] = useState<Set<ViewValueType>>(new Set());

  // Function to find all parent views of the activeView
  const findParentViews = (
    views: ToggleButtonView<ViewValueType>[],
    target: ViewValueType,
    parents: Set<ViewValueType> = new Set()
  ): Set<ViewValueType> => {
    for (const view of views) {
      if (view.value === target) {
        return parents;
      }
      if (view.children) {
        const found = findParentViews(view.children, target, new Set([...parents, view.value]));
        if (found.size) {
          return found;
        }
      }
    }
    return new Set();
  };

  // Expand all parents of activeView on mount or when activeView changes
  useEffect(() => {
    const parents = findParentViews(views, activeView);
    setExpanded((prev) => new Set([...prev, ...parents]));
  }, [activeView, views, findParentViews]);

  const toggleExpand = (view: ViewValueType) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      newSet.has(view) ? newSet.delete(view) : newSet.add(view);
      return newSet;
    });
  };

  // Displays the togglebuttons of the toggle button group. Recursively displays all child buttons and indents by an amount based on the depth of the child.
  const renderViews = (views: ToggleButtonView<ViewValueType>[], level = 0) => {
    return views.map((view) => {
      const startIcon = view.icon ? <Icon path={view.icon} size={0.75} /> : undefined;
      const hasChildren = view.children && view.children.length > 0;
      const isExpanded = expanded.has(view.value);

      return (
        <Box key={view.value} sx={{ ml: level * 1.5, mt: level > 0 ? 0.5 : 0 }}>
          <ToggleButton
            component={Button}
            color="primary"
            startIcon={startIcon}
            endIcon={hasChildren && <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} />}
            value={view.value}
            onClick={() => {
              onViewChange(view.value);
              if (hasChildren) {
                toggleExpand(view.value);
              }
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
