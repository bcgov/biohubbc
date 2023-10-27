import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { ISimsUserWrapper } from 'hooks/useSimsUserWrapper';

export interface ICritterbaseUserWrapper {
  /**
   * Set to `true` if the user's information has finished being loaded, false otherwise.
   */
  isReady: boolean;
  /**
   * The critterbase user uuid.
   */
  critterbaseUserUuid: string | undefined;
}

function useCritterbaseUserWrapper(simsUserWrapper: ISimsUserWrapper): ICritterbaseUserWrapper {
  const cbApi = useCritterbaseApi();

  const critterbaseSignupLoader = useDataLoader(async () => cbApi.authentication.signUp());

  if (simsUserWrapper.isReady && simsUserWrapper.systemUserId) {
    critterbaseSignupLoader.load();
  }

  return {
    isReady: simsUserWrapper.isReady && (simsUserWrapper.systemUserId ? critterbaseSignupLoader.isReady : true),
    critterbaseUserUuid: critterbaseSignupLoader.data?.user_id
  };
}

export default useCritterbaseUserWrapper;
