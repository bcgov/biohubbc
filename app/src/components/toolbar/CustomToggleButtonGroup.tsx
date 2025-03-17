import Icon from '@mdi/react';
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
}

interface CustomToggleButtonGroupProps<ViewValueType extends string | number> {
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
  activeView: ViewValueType | null;
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
  /**
   * Whether no value can be selected
   *
   * @type {('horizontal' | 'vertical')}
   * @memberof CustomToggleButtonGroupProps
   */
  nullable?: boolean
}

/**
 * A custom toggle button group that allows users to select from multiple views.
 *
 * @template ViewValueType
 * @param {CustomToggleButtonGroupProps<ViewValueType>} props
 * @return {*}
 */
const CustomToggleButtonGroup = <ViewValueType extends string | number>(props: CustomToggleButtonGroupProps<ViewValueType>) => {
  const { views, activeView, onViewChange, orientation, nullable } = props;

  return (
    <ToggleButtonGroup
      orientation={orientation}
      value={activeView}
      onChange={(_, view) => {
        if (view || nullable) {
          onViewChange(view);
        }
      }}
      exclusive
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
        const startIcon = (view.icon && <Icon path={view.icon} size={0.75} />) || undefined;

        return (
          <ToggleButton key={view.value} component={Button} color="primary" startIcon={startIcon} value={view.value}>
            {view.label}
          </ToggleButton>
        );
      })}
    </ToggleButtonGroup>
  );
};

export default CustomToggleButtonGroup;
