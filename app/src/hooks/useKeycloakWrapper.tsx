import { useKeycloak } from '@react-keycloak/web';

/**
 * Interface defining the objects and helper functions returned by `useKeycloakWrapper`
 *
 * @export
 * @interface IKeycloakWrapper
 */
export interface IKeycloakWrapper {
  keycloak: any;
}

/**
 * Wraps the raw keycloak object, returning an object that contains the original raw keycloak instances, and any useful
 * helper functions.
 *
 * @return {*}  {IKeycloakWrapper}
 */
function useKeycloakWrapper(): IKeycloakWrapper {
  const { keycloak } = useKeycloak();

  return {
    keycloak: keycloak
  };
}

export default useKeycloakWrapper;
