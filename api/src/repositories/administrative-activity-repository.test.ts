import chai, { expect } from "chai";
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from "../__mocks__/db";
import { AdministrativeActivityRepository } from "./administrative-activity-repository";

chai.use(sinonChai);

describe('AdministrativeActivityRepository', () => {
  it('should construct', () => {
    const mockDBConnection = getMockDBConnection();
    const aaRepo = new AdministrativeActivityRepository(mockDBConnection);

    expect(aaRepo).to.be.instanceof(AdministrativeActivityRepository);
  });

  describe('getAdministrativeActivities', () => {
    // @TODO
  });

  describe('createPendingAccessRequest', () => {
    // @TODO
  });

  describe('getAdministrativeActivityStanding', () => {
    // @TODO
  });

  describe('putAdministrativeActivity', () => {
    // @TODO
  });
});
