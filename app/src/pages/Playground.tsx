import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';

export const Playground = () => {
  const critterbase = useCritterbaseApi();
  const { data, load } = useDataLoader(() =>
    critterbase.critters.getCritterByID('4bd8fe08-f0e1-41fd-99b3-494fab00a763')
  );
  if (!data) {
    load();
  }

  return (
    <>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  );
};
