import { useAuthStateContext } from 'hooks/useAuthStateContext';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetUserSurveyParticipantResponse } from 'interfaces/useSurveyApi.interface';
import React, { useCallback, useMemo } from 'react';
import { useParams } from 'react-router';
import { hasAtLeastOneValidValue } from 'utils/authUtils';

export interface ISurveyAuthStateContext {
  getSurveyParticipant: () => IGetUserSurveyParticipantResponse;
  hasSurveyRole: (validSurveyRoles?: string[]) => boolean;
  hasSystemRole: (validSystemRoles?: string[]) => boolean;
  hasSurveyPermission: (validSurveyPermissions?: string[]) => boolean;
  getSurveyId: () => number;
  hasLoadedParticipantInfo: boolean;
}

export const SurveyAuthStateContext = React.createContext<ISurveyAuthStateContext>({
  getSurveyParticipant: () => null,
  hasSurveyRole: () => false,
  hasSystemRole: () => false,
  hasSurveyPermission: () => false,
  getSurveyId: () => -1,
  hasLoadedParticipantInfo: false
});

export const SurveyAuthStateContextProvider: React.FC<React.PropsWithChildren> = (props) => {
  const biohubApi = useBiohubApi();
  const participantDataLoader = useDataLoader((surveyId: number) =>
    biohubApi.surveyParticipants.getUserSurveyParticipant(surveyId)
  );
  const authStateContext = useAuthStateContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyId: string | number | undefined = urlParams['id'];

  const getSurveyId = useCallback(() => {
    return Number(surveyId);
  }, [surveyId]);

  const getSurveyParticipant = useCallback(() => {
    return participantDataLoader.data ?? null;
  }, [participantDataLoader.data]);

  const hasSurveyRole = useCallback(
    (validSurveyRoles?: string[]): boolean => {
      //If no Survey role is provided then return false
      if (!validSurveyRoles?.length) {
        return false;
      }

      const participant = getSurveyParticipant();

      if (!participant) {
        return false;
      }

      return (
        participant?.survey_id === getSurveyId() &&
        participant?.survey_role_names.some((roleName) => validSurveyRoles.includes(roleName))
      );
    },
    [getSurveyId, getSurveyParticipant]
  );

  const hasSurveyPermission = useCallback(
    (validSurveyPermissions?: string[]): boolean => {
      //If no Survey role is provided then return false
      if (!validSurveyPermissions?.length) {
        return false;
      }

      const participant = getSurveyParticipant();

      if (!participant) {
        return false;
      }

      return (
        participant?.survey_id === getSurveyId() &&
        participant?.survey_role_permissions.some((roleName) => validSurveyPermissions.includes(roleName))
      );
    },
    [getSurveyId, getSurveyParticipant]
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
    // If perceived surveyId does not differ from the currently loaded participant, skip refresh
    if (!surveyId || surveyId === participantDataLoader.data?.survey_id) {
      return;
    }

    participantDataLoader.refresh(getSurveyId());

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSurveyId]);

  const surveyAuthStateContext: ISurveyAuthStateContext = useMemo(
    () => ({
      hasSurveyRole,
      hasSystemRole,
      hasSurveyPermission,
      getSurveyParticipant,
      getSurveyId,
      hasLoadedParticipantInfo: participantDataLoader.isReady
    }),
    [
      hasSurveyRole,
      hasSystemRole,
      hasSurveyPermission,
      getSurveyParticipant,
      getSurveyId,
      participantDataLoader.isReady
    ]
  );

  return (
    <SurveyAuthStateContext.Provider value={surveyAuthStateContext}>{props.children}</SurveyAuthStateContext.Provider>
  );
};
