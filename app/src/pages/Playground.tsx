import { Box } from "@material-ui/core";
import { useBiohubApi } from "hooks/useBioHubApi";
import useDataLoader from "hooks/useDataLoader";
import useKeycloakWrapper from "hooks/useKeycloakWrapper";

export const Playground = () => {
  const api = useBiohubApi();
  const keycloak = useKeycloakWrapper();
  const dataLoader = useDataLoader(api.critterbase.getAllMarkings);
  if (keycloak.critterbaseUuid()) {
    dataLoader.load();
  }
  const data = dataLoader.data ?? [];
  return (
    <Box>
      {data.map((a: Record<string, unknown>) => {
        return <p>{JSON.stringify(a)}</p>;
      })}
    </Box>
  );
};
