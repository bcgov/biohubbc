import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export interface ToggleButtonView<T extends string | number> {
  /**
   * The value of the toggle button, which will be passed to the `onViewChange` callback.
   *
   * @type {T}
   * @memberof ToggleButtonView
   */
  value: T;
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
}

interface CustomToggleButtonGroupProps<T extends string | number> {
  /**
   * An array of views to display in the toggle button group.
   *
   * @type {ToggleButtonView<T>[]}
   * @memberof CustomToggleButtonGroupProps
   */
  views: ToggleButtonView<T>[];
  /**
   * The currently selected views.
   *
   * @type {T[]}
   * @memberof CustomToggleButtonGroupProps
   */
  activeViews: T[];
  /**
   * Callback fired when a toggle button is clicked.
   *
   * @memberof CustomToggleButtonGroupProps
   */
  onViewChange: (views: T[]) => void;
  /**
   * The orientation of the toggle button group.
   *
   * @type {('horizontal' | 'vertical')}
   * @memberof CustomToggleButtonGroupProps
   */
  orientation: 'horizontal' | 'vertical';
  /**
   * Whether no value can be selected
   *
   * @type {boolean}
   * @memberof CustomToggleButtonGroupProps
   */
  nullable?: boolean;
}

/**
 * A custom toggle button group that allows users to select from multiple views.
 *
 * @template T
 * @param {CustomToggleButtonGroupProps<T>} props
 * @return {*}
 */
const CustomToggleButtonGroup = <T extends string | number>(props: CustomToggleButtonGroupProps<T>) => {
  const { views, activeViews, onViewChange, orientation, nullable } = props;

  const handleToggle = (_: React.MouseEvent<HTMLElement>, value: T) => {
    let newActiveViews = [...activeViews];

    if (newActiveViews.includes(value)) {
      newActiveViews = newActiveViews.filter((view) => view !== value);
    } else if (nullable || newActiveViews.length > 0) {
      newActiveViews.push(value);
    }

    onViewChange(newActiveViews);
  };

  return (
    <ToggleButtonGroup
      orientation={orientation}
      value={activeViews}
      onChange={(_, value) => handleToggle(_, value)}
      exclusive={false} // Allows multiple selections
      sx={{
        display: 'flex',
        flex: '1 1 auto',
        gap: 0.5,
        '& Button': {
          py: 1,
          px: 2,
          border: 'none',
          borderRadius: '4px !important',
          fontSize: '0.875rem',
          fontWeight: 700,
          letterSpacing: '0.02rem',
          justifyContent: 'flex-start'
        }
      }}>
      {views.map((view) => {
        const startIcon = view.icon && <Icon path={view.icon} size={0.75} />;

        return (
          <ToggleButton
            key={view.value}
            component={Button}
            value={view.value}
            onClick={(e) => handleToggle(e, view.value)}
            startIcon={startIcon}>
            <Box display="flex" alignItems="center">
              <Checkbox sx={{ pl: 0.5, py: 0.5 }} checked={activeViews.includes(view.value)} />
              {view.label}
            </Box>
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default CustomToggleButtonGroup;
