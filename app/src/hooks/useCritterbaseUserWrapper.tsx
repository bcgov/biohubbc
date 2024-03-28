import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ISimsUserWrapper } from 'hooks/useSimsUserWrapper';

export interface ICritterbaseUserWrapper {
  /**
   * Set to `true` if the user's information is still loading, false otherwise.
   */
  isLoading: boolean;
  /**
   * The critterbase user uuid.
   */
  critterbaseUserUuid: string | undefined;
}

function useCritterbaseUserWrapper(simsUserWrapper: ISimsUserWrapper): ICritterbaseUserWrapper {
  const critterbaseApi = useCritterbaseApi();

  const critterbaseSignupLoader = useDataLoader(async () =>
    critterbaseApi.authentication.signUp().catch(() => {
      // Squash the error
      return undefined;
    })
  );

  if (!simsUserWrapper.isLoading && simsUserWrapper.systemUserId) {
    critterbaseSignupLoader.load();
  }

  return {
    isLoading: simsUserWrapper.isLoading || (simsUserWrapper.systemUserId ? !critterbaseSignupLoader.isReady : false),
    critterbaseUserUuid: critterbaseSignupLoader.data?.user_id
  };
}

export default useCritterbaseUserWrapper;
