import { Box } from "@material-ui/core";
import { useCritterbaseApi } from "hooks/useCritterbaseApi";
import useDataLoader from "hooks/useDataLoader";
// import useKeycloakWrapper from "hooks/useKeycloakWrapper";

export const Playground = () => {
  const api = useCritterbaseApi();
  // const keycloak = useKeycloakWrapper();
  const dataLoader = useDataLoader(api.markings.getAllMarkings);
  dataLoader.load();
  const data = dataLoader.data ?? [];
  return (
    <Box>
      {data?.map((a: Record<string, unknown>) => {
        return <p>{JSON.stringify(a)}</p>;
      })}
    </Box>
  );
};
