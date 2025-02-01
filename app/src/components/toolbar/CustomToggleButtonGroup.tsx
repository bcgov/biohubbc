import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

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
   * Optional children views, which can be indented
   *
   * @type {string}
   * @memberof ToggleButtonView
   */
  children?: ToggleButtonView<ViewValueType>[];
}

interface CustomToggleButtonGroupProps<ViewValueType extends string> {
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
 * A custom toggle button group that allows users to select from multiple views.
 *
 * @template ViewValueType
 * @param {CustomToggleButtonGroupProps<ViewValueType>} props
 * @return {*}
 */
const CustomToggleButtonGroup = <ViewValueType extends string>(props: CustomToggleButtonGroupProps<ViewValueType>) => {
  const { views, activeView, onViewChange, orientation } = props;

  const renderViews = (views: ToggleButtonView<ViewValueType>[], level: number = 0) => {
    return views.map((view) => {
      const startIcon = view.icon ? <Icon path={view.icon} size={0.75} /> : undefined;

      return (
        <Box
          key={view.value}
          sx={{
            marginLeft: level * 2, 
            mt: level > 0 ? 0.5 : 0
          }}>
          <ToggleButton
            component={Button}
            color="primary"
            startIcon={startIcon}
            value={view.value}
            onClick={() => onViewChange(view.value)}>
            {view.label}
          </ToggleButton>

          {/* Render child views if they exist */}
          {view.children && view.children.length > 0 && renderViews(view.children, level + 1)}
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
