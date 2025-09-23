import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetUserSurveyMemberResponse } from 'interfaces/useSurveyMemberApi.interface';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { hasAtLeastOneValidValue } from 'utils/authUtils';

export interface ISurveyAuthStateContext {
  getSurveyMember: () => IGetUserSurveyMemberResponse;
  hasSurveyRole: (validSurveyRoles?: string[]) => boolean;
  hasSystemRole: (validSystemRoles?: string[]) => boolean;
  getSurveyId: () => number;
  hasLoadedMemberInfo: boolean;
}

export const SurveyAuthStateContext = React.createContext<ISurveyAuthStateContext>({
  getSurveyMember: () => null,
  hasSurveyRole: () => false,
  hasSystemRole: () => false,
  getSurveyId: () => -1,
  hasLoadedMemberInfo: false
});

export const SurveyAuthStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const biohubApi = useBiohubApi();
  const memberDataLoader = useDataLoader((surveyId: number) => biohubApi.surveyMembers.getUserSurveyMember(surveyId));
  const authStateContext = useAuthStateContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyId: string | number | undefined = urlParams['survey_id'];

  const getSurveyId = useCallback(() => {
    return Number(surveyId);
  }, [surveyId]);

  const getSurveyMember = useCallback(() => {
    return memberDataLoader.data ?? null;
  }, [memberDataLoader.data]);

  const hasSurveyRole = useCallback(
    (validSurveyRoles?: string[]): boolean => {
      //If no Survey role is provided then return false
      if (!validSurveyRoles?.length) {
        return false;
      }

      const member = getSurveyMember();

      console.log('#MEMBER', member);

      if (!member) {
        return false;
      }

      console.log('MEMBER#', member);

      return member?.survey_id === getSurveyId() && validSurveyRoles.includes(member?.survey_role_name);
    },
    [getSurveyId, getSurveyMember]
  );

  const hasSystemRole = useCallback(
    (validSystemRoles?: string[]): boolean => {
      //If no System role is provided then return false
      if (!validSystemRoles?.length) {
        return false;
      }

      return hasAtLeastOneValidValue(validSystemRoles, authStateContext.simsUserWrapper.roleNames);
    },
    [authStateContext.simsUserWrapper]
  );

  React.useEffect(() => {
    // If perceived surveyId does not differ from the currently loaded member, skip refresh
    if (!surveyId || surveyId === memberDataLoader.data?.survey_id) {
      return;
    }

    memberDataLoader.refresh(getSurveyId());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSurveyId]);

  const surveyAuthStateContext: ISurveyAuthStateContext = useMemo(
    () => ({
      hasSurveyRole,
      hasSystemRole,
      getSurveyMember,
      getSurveyId,
      hasLoadedMemberInfo: memberDataLoader.isReady
    }),
    [hasSurveyRole, hasSystemRole, getSurveyMember, getSurveyId, memberDataLoader.isReady]
  );

  return (
    <SurveyAuthStateContext.Provider value={surveyAuthStateContext}>{props.children}</SurveyAuthStateContext.Provider>
  );
};
