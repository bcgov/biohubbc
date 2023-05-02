import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';
import { getMockDBConnection } from "../__mocks__/db";
import { AdministrativeActivityService } from "./administrative-activity-service";

chai.use(sinonChai);

describe('AdministrativeActivityService', () => {
    it('constructs', () => {
      const mockDBConnection = getMockDBConnection();
  
      const aaService = new AdministrativeActivityService(mockDBConnection);
  
      expect(aaService).to.be.instanceof(AdministrativeActivityService);
    });
});
