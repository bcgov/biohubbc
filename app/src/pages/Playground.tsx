import { Box } from "@material-ui/core";
import { useBiohubApi } from "hooks/useBioHubApi";
import useDataLoader from "hooks/useDataLoader";

export const Playground = () => {
  const api = useBiohubApi();
  const dataLoader = useDataLoader(api.critterbase.getAllMarkings);
  dataLoader.load();
  const data = dataLoader.data ?? [];
  return (
    <Box>
      {data.map((a: Record<string, unknown>) => {
        return <p>{JSON.stringify(a)}</p>;
      })}
    </Box>
  );
};
