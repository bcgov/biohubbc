interface ComponentSwitchProps<T extends string | number> {
  /**
   * The key of the component to switch to.
   *
   * @type {T} The type of the current view.
   */
  switch: T;
  /**
   * A record of components to switch between.
   *
   * @type {Record<T, JSX.Element>} A record of components to switch between.
   */
  components: Record<T, JSX.Element>;
}

/**
 * Switch between components based on the current switch value.
 *
 * @template T The type of switch value.
 * @param {ComponentSwitchProps} props The props for the component.
 * @returns {JSX.Element | null} The rendered component.
 */
export const ComponentSwitch = <T extends string>(props: ComponentSwitchProps<T>): JSX.Element | null => {
  // If the current switch value is not in the list of components, return null
  if (!props.components[props.switch]) {
    return null;
  }

  // Otherwise, return the current view
  return props.components[props.switch];
};
