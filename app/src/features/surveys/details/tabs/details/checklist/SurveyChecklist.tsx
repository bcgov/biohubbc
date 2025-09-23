import { mdiChevronDown, mdiChevronRight } from '@mdi/js';
import Icon from '@mdi/react';
import { Checkbox, Collapse, List, ListItem, ListItemButton, ListItemText } from '@mui/material';
import grey from '@mui/material/colors/grey';
import { CustomTooltip } from 'components/tooltip/CustomTooltip';
import { useCallback, useEffect } from 'react';
import appTheme from 'themes/appTheme';

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

interface SurveyChecklistProps<ViewValueType extends string> {
  views: ToggleButtonView<ViewValueType>[];
  activeView: ViewValueType | null;
  onViewChange: (view: ViewValueType) => void;
  handleCheckbox?: (view: ToggleButtonView<ViewValueType>) => void;
  expanded: Set<ViewValueType>;
  handleExpand: (newValue: Set<ViewValueType>) => void;
}

export const SurveyChecklist = <ViewValueType extends string>({
  views,
  activeView,
  onViewChange,
  handleCheckbox,
  expanded,
  handleExpand
}: SurveyChecklistProps<ViewValueType>) => {
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

  const toggleExpand = (value: ViewValueType) => {
    const item = views.find((v) => v.value === value);
    const isTopLevelHeader = item?.isHeader && !findParentViews(views, value).size;

    if (isTopLevelHeader && value !== 'telemetry') {
      return;
    }

    const updated = new Set(expanded);
    expanded.has(value) ? updated.delete(value) : updated.add(value);
    handleExpand(updated);
  };

  useEffect(() => {
    const updated = new Set(expanded);

    views.forEach((item) => {
      const isTopLevelHeader = item.isHeader && !findParentViews(views, item.value).size;
      if (isTopLevelHeader && item.value !== 'telemetry') {
        updated.add(item.value);
      }
    });

    if (activeView) {
      const parents = findParentViews(views, activeView);
      for (const p of parents) {
        updated.add(p);
      }
    }

    handleExpand(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, views, findParentViews]);

  const renderViews = (items: ToggleButtonView<ViewValueType>[], level = 0): JSX.Element[] => {
    return items.flatMap((item) => {
      const hasChildren = !!item.children?.length;
      const isExpanded = expanded.has(item.value);
      const isTopLevelHeader = item.isHeader && !findParentViews(views, item.value).size;
      const isActive = activeView === item.value;

      const listItem = (
        <ListItem key={item.value} disablePadding sx={{ pl: level * 3 - 3 }}>
          <CustomTooltip tooltip={item.tooltip ?? ''}>
            {!isTopLevelHeader ? (
              <ListItemButton
                selected={isActive}
                onClick={() => {
                  if (item.isHeader || hasChildren) {
                    toggleExpand(item.value);
                  }
                  if (!item.isHeader) {
                    onViewChange(item.value);
                  }
                }}
                sx={{
                  borderRadius: 1,
                  py: isTopLevelHeader ? 0 : 0.5,
                  '&.Mui-selected': {
                    backgroundColor: appTheme.palette.action.selected,
                    '& .MuiTypography-root': {
                      color: appTheme.palette.primary.main
                    }
                  },
                  '&:hover': {
                    backgroundColor: appTheme.palette.action.hover
                  },
                  '& .MuiTypography-root': {
                    fontWeight: 700,
                    opacity: item.disabled ? 0.5 : 1,
                    cursor: item.disabled && !item.checkbox ? 'default' : 'pointer',
                    color: appTheme.palette.text.secondary,
                    fontSize: isTopLevelHeader ? '0.875rem' : '1rem',
                    textTransform: isTopLevelHeader ? 'uppercase' : 'capitalize'
                  }
                }}>
                <ListItemText primary={item.label} />
                {!isTopLevelHeader && item.children && item.children?.length > 0 && (
                  <Icon path={isExpanded ? mdiChevronDown : mdiChevronRight} size={1} color={grey[400]} />
                )}
                {item.checkbox && (
                  <CustomTooltip
                    tooltip={item.disabled ? 'Change sites to applicable' : 'Change sites to non-applicable'}>
                    <Checkbox
                      checked={item.isChecked}
                      onClick={(e) => {
                        handleCheckbox?.(item);
                        e.stopPropagation();
                      }}
                      size="small"
                      sx={{
                        '& .MuiSvgIcon-root': {
                          fill: item.disabled ? grey[300] : appTheme.palette.primary.main
                        }
                      }}
                    />
                  </CustomTooltip>
                )}
              </ListItemButton>
            ) : (
              <ListItemText
                primary={item.label}
                sx={{
                  my: 1,
                  '& .MuiTypography-root': {
                    fontWeight: 700,
                    color: grey[500],
                    letterSpacing: 0.35,
                    fontSize: '0.875rem',
                    textTransform: 'uppercase',
                    paddingLeft: 1.5,
                    paddingY: 1,
                    paddingTop: '1rem',
                    '&:first-of-type': {
                      paddingTop: 0
                    }
                  }
                }}
              />
            )}
          </CustomTooltip>
        </ListItem>
      );

      const children = hasChildren ? (
        <Collapse key={`${item.value}-children`} in={isExpanded} unmountOnExit>
          {renderViews(item.children!, level + 1)}
        </Collapse>
      ) : null;

      return children ? [listItem, children] : [listItem];
    });
  };

  return <List disablePadding>{renderViews(views)}</List>;
};
