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
   * Note: Partial allows switches of an `enum` type to not require components for all values.
   *
   * @type {Partial<Record<T, JSX.Element>>} A record of components to switch between.
   */
  components: Partial<Record<T, JSX.Element>>;
}

/**
 * Switch between components based on the current switch value.
 *
 * @template T The type of switch value.
 * @param {ComponentSwitchProps} props The props for the component.
 * @returns {JSX.Element | null} The rendered component.
 */
export const ComponentSwitch = <T extends string>(props: ComponentSwitchProps<T>): JSX.Element | null => {
  const component = props.components[props.switch];

  if (!component) {
    return null;
  }

  return component;
};
