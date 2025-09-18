import { SURVEY_ROLE } from '../constants/roles';
import { IDBConnection } from '../database/db';
import { ApiGeneralError } from '../errors/api-error';
import { IPostSurveyMember } from '../models/survey-create';
import { SystemUserWithRoles } from '../models/system-user-view';
import {
  IMember,
  SurveyMember,
  SurveyMemberRecord,
  SurveyMemberRepository,
  UserSurveyMember
} from '../repositories/survey-member-repository';

import { DBService } from './db-service';
import { UserService } from './user-service';

export class SurveyMemberService extends DBService {
  userService: UserService;
  surveyMemberRepository: SurveyMemberRepository;

  constructor(connection: IDBConnection) {
    super(connection);

    this.userService = new UserService(connection);
    this.surveyMemberRepository = new SurveyMemberRepository(connection);
  }

  /**
   * Gets the survey participant, adding them if they do not already exist.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @param {number} surveyMemberRoleId
   * @return {*}  {Promise<void>}
   * @memberof SurveyMemberService
   */
  async ensureSurveyMember(surveyId: number, systemUserId: number, surveyMemberRole: string): Promise<void> {
    const surveyMemberRecord = await this.getSurveyMember(surveyId, systemUserId);

    if (surveyMemberRecord) {
      // survey participant already exists, do nothing
      return;
    }

    // add new survey participant record
    await this.insertSurveyMember(surveyId, systemUserId, surveyMemberRole);
  }

  /**
   * Adds a survey participant to the survey.
   *
   * @param {number} surveyId
   * @param {(IMember & { userGuid: string | null })} participant
   * @memberof SurveyMemberService
   */
  async ensureSystemUserAndSurveyMemberUser(surveyId: number, participant: IMember & { userGuid: string | null }) {
    // Create or activate the system user
    const systemUserObject = await this.userService.ensureSystemUser(
      participant.userGuid,
      participant.userIdentifier,
      participant.identitySource,
      participant.displayName,
      participant.email
    );

    // Add survey role, unless they already have one
    await this.ensureSurveyMember(surveyId, systemUserObject.system_user_id, participant.surveyRoleName);
  }

  /**
   * Adds multiple survey participants to the survey.
   *
   * @param {number} surveyId
   * @param {IInsertSurveyMember[]} members
   * @return {*}  {Promise<void[]>}
   * @memberof SurveyMemberService
   */
  async insertSurveyMembers(surveyId: number, members: IPostSurveyMember[]): Promise<void[]> {
    return Promise.all(
      members.map((member) => this.insertSurveyMember(surveyId, member.system_user_id, member.survey_role_name))
    );
  }

  /**
   * Adds a survey participant to the survey.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @param {(string)} surveyMemberRole
   * @return {*}  {Promise<void>}
   * @memberof SurveyMemberService
   */
  async insertSurveyMember(surveyId: number, systemUserId: number, surveyMemberRole: string): Promise<void> {
    return this.surveyMemberRepository.insertSurveyMember(surveyId, systemUserId, surveyMemberRole);
  }

  /**
   * Adds multiple survey participants to any number of surveys (bulk permissions).
   *
   * @param {number[]} surveyIds
   * @param {IInsertSurveyMember[]} members
   * @return {*}  {Promise<void[]>}
   * @memberof SurveyMemberService
   */
  async insertMembersToSurveys(surveyIds: number[], members: IPostSurveyMember[]): Promise<void> {
    const promises: Promise<void>[] = [];

    for (const surveyId of surveyIds) {
      const memberPayload = members.map((member) => ({
        survey_id: surveyId,
        system_user_id: member.system_user_id,
        survey_role_name: member.survey_role_name
      }));

      promises.push(this.surveyMemberRepository.insertMultipleSurveyMembers(memberPayload));
    }

    await Promise.all(promises);
  }

  /**
   * Deletes a survey member record.
   *
   * @param {number} surveyId
   * @param {number} surveyMemberId
   * @return {*}  {Promise<SurveyMemberRecord>}
   * @memberof SurveyMemberService
   */
  async deleteSurveyMemberRecord(surveyId: number, surveyMemberId: number): Promise<SurveyMemberRecord> {
    return this.surveyMemberRepository.deleteSurveyMemberRecord(surveyId, surveyMemberId);
  }

  /**
   * Get the survey participant for the given survey id and system user.
   *
   * @param {number} surveyId
   * @param {number} systemUserId
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles) | null>)}
   * @memberof SurveyMemberService
   */
  async getSurveyMember(surveyId: number, systemUserId: number): Promise<(SurveyMember & SystemUserWithRoles) | null> {
    return this.surveyMemberRepository.getSurveyMember(surveyId, systemUserId);
  }

  /**
   * Get the survey participant for the given survey and user guid.
   *
   * @param {number} surveyId
   * @param {number} userGuid
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles) | null>)}
   * @memberof SurveyMemberService
   */
  async getSurveyMemberBySurveyIdAndUserGuid(
    surveyId: number,
    userGuid: string
  ): Promise<(SurveyMember & SystemUserWithRoles) | null> {
    return this.surveyMemberRepository.getSurveyMemberBySurveyIdAndUserGuid(surveyId, userGuid);
  }

  /**
   * Gets the survey participants for the given survey.
   *
   * @param {number} surveyId
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles)[]>)}
   * @memberof SurveyMemberService
   */
  async getSurveyMembers(surveyId: number): Promise<(SurveyMember & SystemUserWithRoles)[]> {
    return this.surveyMemberRepository.getSurveyMembers(surveyId);
  }

  /**
   * Fetches the survey participants for all surveys that the given system user is a member of.
   *
   * @param {number} systemUserId
   * @return {*}  {(Promise<(SurveyMember & SystemUserWithRoles)[]>)}
   * @memberof surveyMemberRepository
   */
  async getMembersFromAllSurveysBySystemUserId(systemUserId: number): Promise<(SurveyMember & SystemUserWithRoles)[]> {
    return this.surveyMemberRepository.getMembersFromAllSurveysBySystemUserId(systemUserId);
  }

  /**
   * Fetches all surveys for the given system user.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<UserSurveyMember[]>}
   * @memberof SurveyMemberService
   */
  async getSurveysBySystemUserId(systemUserId: number): Promise<UserSurveyMember[]> {
    return this.surveyMemberRepository.getSurveysBySystemUserId(systemUserId);
  }

  /**
   * Check if the given user is the only coordinator on at least 1 survey.
   *
   * Why? All surveys must have at least 1 coordinator. If this user is the only coordinator then deleting them or
   * updating them to not be a coordinator should not be allowed.
   *
   * @param {number} systemUserId
   * @return {*}  {Promise<boolean>} `true` if the user is the only survey coordinator on at least 1 survey, `false`
   * otherwise.
   * @memberof SurveyMemberService
   */
  async isUserTheOnlySurveyCoordinatorOnAnySurvey(systemUserId: number): Promise<boolean> {
    const surveyMemberService = new SurveyMemberService(this.connection);

    const getAllMembersResponse = await surveyMemberService.getMembersFromAllSurveysBySystemUserId(systemUserId);

    if (!getAllMembersResponse.length) {
      // User has no surveys, and therefore is not the only coordinator on a survey
      return false;
    }

    const doAllSurveysHaveACoordinatorIfUserIsRemoved = this.doAllSurveysHaveASurveyLeadIfUserIsRemoved(
      getAllMembersResponse,
      systemUserId
    );

    // Negate above response, because `false` indicates the user is the only coordinator, and this function returns
    // `true` in that situation
    return !doAllSurveysHaveACoordinatorIfUserIsRemoved;
  }

  /**
   * Given an array of survey participants, return `false` if any survey has no Coordinator role. Return `true`
   * otherwise.
   *
   * @param {SurveyMember[]} surveyUsers
   * @return {*}  {boolean}
   */
  doAllSurveysHaveASurveyLead(surveyUsers: SurveyMember[]): boolean {
    // No survey with Coordinator
    if (!surveyUsers.length) {
      return false;
    }

    const surveyLeadsPerSurvey: { [key: string]: any } = {};

    // count how many coordinator roles there are per survey
    surveyUsers.forEach((row) => {
      const key = row.survey_id;

      if (!surveyLeadsPerSurvey[key]) {
        surveyLeadsPerSurvey[key] = 0;
      }

      if (row.survey_role_name.includes(SURVEY_ROLE.ADMIN)) {
        surveyLeadsPerSurvey[key] += 1;
      }
    });

    const surveyLeadCounts = Object.values(surveyLeadsPerSurvey);

    // check if any surveys would be left with no Coordinator
    for (const count of surveyLeadCounts) {
      if (!count) {
        // found a survey with no Coordinator
        return false;
      }
    }

    // all surveys have a Coordinator
    return true;
  }

  /**
   * Given an array of survey member role objects, return true if any survey has no Coordinator role after
   * removing all rows associated with the provided `userId`. Return false otherwise.
   *
   * @param {SurveyMember[]} surveyUsers
   * @param {number} systemUserId
   * @return {*}  {boolean}
   */
  doAllSurveysHaveASurveyLeadIfUserIsRemoved(surveyUsers: SurveyMember[], systemUserId: number): boolean {
    // No survey with coordinator
    if (!surveyUsers.length) {
      return false;
    }

    const surveyLeadsPerSurvey: { [key: string]: any } = {};

    // count how many Coordinator roles there are per survey
    surveyUsers.forEach((row) => {
      const key = row.survey_id;

      if (!surveyLeadsPerSurvey[key]) {
        surveyLeadsPerSurvey[key] = 0;
      }

      if (row.system_user_id !== systemUserId && row.survey_role_name.includes(SURVEY_ROLE.ADMIN)) {
        surveyLeadsPerSurvey[key] += 1;
      }
    });

    const surveyLeadCounts = Object.values(surveyLeadsPerSurvey);

    // check if any surveys would be left with no Coordinator
    for (const count of surveyLeadCounts) {
      if (!count) {
        // found a survey with no Coordinator
        return false;
      }
    }

    // all surveys have a Coordinator
    return true;
  }

  /**
   * Internal function for validating that all Survey members have a role
   *
   * @param {IPostSurveyMember[]} participants
   * @param {SURVEY_ROLE} roleToCheck
   * @return {*}  {boolean}
   * @memberof SurveyMemberService
   */
  _doSurveyMembersHaveARole(participants: IPostSurveyMember[], roleToCheck: SURVEY_ROLE): boolean {
    return participants.some((item) => item.survey_role_name === roleToCheck);
  }

  /**
   * Internal function for validating that all survey participants have one unique role.
   *
   * @param {IPostSurveyMember[]} participants
   * @return {*}  {boolean}
   * @memberof SurveyMemberService
   */
  _doSurveyMembersHaveOneRole(participants: IPostSurveyMember[]): boolean {
    // Map of system_user_id to set of unique role names
    const participantUniqueRoles = new Map<number, Set<string>>();

    for (const participant of participants) {
      const system_user_id = participant.system_user_id;
      const survey_role_name = participant.survey_role_name;

      // Get the set of unique role names, or initialize a new set if the user is not in the map
      const uniqueRoleNamesForMember = participantUniqueRoles.get(system_user_id) ?? new Set<string>();

      for (const role of survey_role_name) {
        // Add the role names to the set, converting to lowercase to ensure case-insensitive comparison
        uniqueRoleNamesForMember.add(role.toLowerCase());
      }

      // Update the map with the new set of unique role names
      participantUniqueRoles.set(system_user_id, uniqueRoleNamesForMember);
    }

    // Returns true if all participants have one unique role
    return Array.from(participantUniqueRoles.values()).every((roleNames) => roleNames.size === 1);
  }

  /**
   * Updates existing participants, deletes those participants not in the incoming list, and inserts new participants.
   *
   * @param {number} surveyId
   * @param {IPostSurveyMember[]} incomingMembers
   * @return {*}  {Promise<void>}
   * @throws ApiGeneralError If no participant has a coordinator role or if any participant has multiple roles.
   * @memberof SurveyMemberService
   */
  async upsertSurveyMemberData(surveyId: number, incomingMembers: IPostSurveyMember[]): Promise<void> {
    // Confirm that at least one participant has a coordinator role
    if (!this._doSurveyMembersHaveARole(incomingMembers, SURVEY_ROLE.ADMIN)) {
      throw new ApiGeneralError(`Surveys require that at least one participant has a ${SURVEY_ROLE.ADMIN} role.`);
    }

    // Check for multiple roles for any participant
    if (!this._doSurveyMembersHaveOneRole(incomingMembers)) {
      throw new ApiGeneralError(
        'Users can only have one role per Survey but multiple roles were specified for at least one user.'
      );
    }

    // Fetch existing participants for the survey
    const existingMembers = await this.surveyMemberRepository.getSurveyMembers(surveyId);

    // Prepare promises for all database operations
    const promises: Promise<any>[] = [];

    // Identify participants to delete
    const participantsToDelete = existingMembers.filter(
      (existingMember) =>
        !incomingMembers.some((incomingMember) => incomingMember.system_user_id === existingMember.system_user_id)
    );

    // Delete participants not present in the incoming payload
    participantsToDelete.forEach((participantToDelete) => {
      promises.push(
        this.surveyMemberRepository.deleteSurveyMemberRecord(surveyId, participantToDelete.survey_member_id)
      );
    });

    // Upsert participants based on conditions
    incomingMembers.forEach((incomingMember) => {
      const existingMember = existingMembers.find(
        (existingMember) => existingMember.system_user_id === incomingMember.system_user_id
      );

      if (existingMember) {
        // Update existing participant's role
        if (incomingMember.survey_role_name !== existingMember.survey_role_name) {
          promises.push(
            this.surveyMemberRepository.updateSurveyMemberRole(
              incomingMember.survey_member_id ?? existingMember.survey_member_id,
              incomingMember.survey_role_name[0]
            )
          );
        }
      } else if (!existingMember) {
        // Insert new participant if the user does not already exist in the survey, otherwise triggers database constraint error
        promises.push(
          this.surveyMemberRepository.insertSurveyMember(
            surveyId,
            incomingMember.system_user_id,
            incomingMember.survey_role_name[0]
          )
        );
      }
      // If the participant already exists with the desired role, do nothing
    });

    await Promise.all(promises);
  }
}
