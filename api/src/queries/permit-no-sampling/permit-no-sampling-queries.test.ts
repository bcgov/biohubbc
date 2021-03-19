import { expect } from 'chai';
import { describe } from 'mocha';
import { IPostPermitNoSampling } from '../../models/permit-no-sampling';
import { PostCoordinatorData } from '../../models/project';
import { postPermitNoSamplingSQL } from './permit-no-sampling-queries';

describe('postPermitNoSamplingSQL', () => {
  describe('with invalid parameters', () => {
    it('returns null when no noSamplePermit provided', () => {
      const response = postPermitNoSamplingSQL((null as unknown) as IPostPermitNoSampling & PostCoordinatorData);

      expect(response).to.be.null;
    });

    it('returns a SQLStatement when all fields are passed in as expected', () => {
      const response = postPermitNoSamplingSQL({
        permit_number: '123',
        first_name: 'first',
        last_name: 'last',
        email_address: 'email',
        coordinator_agency: 'agency',
        share_contact_details: false
      });

      expect(response).to.not.be.null;

      expect(response?.values.length).to.equal(5);

      expect(response?.values).to.deep.include('123');
      expect(response?.values).to.deep.include('first');
      expect(response?.values).to.deep.include('last');
      expect(response?.values).to.deep.include('email');
      expect(response?.values).to.deep.include('agency');
    });
  });
});
