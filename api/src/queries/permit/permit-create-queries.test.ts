import { expect } from 'chai';
import { describe } from 'mocha';
import { IPostPermitNoSampling } from '../../models/permit-no-sampling';
import { PostCoordinatorData } from '../../models/project-create';
import { postPermitNoSamplingSQL, postProjectPermitSQL } from './permit-create-queries';

describe('postPermitNoSamplingSQL', () => {
  const data = {
    permit_number: '123',
    permit_type: 'permit type',
    first_name: 'first',
    last_name: 'last',
    email_address: 'email',
    coordinator_agency: 'agency',
    share_contact_details: false
  };

  it('returns null when no noSamplePermit provided', () => {
    const response = postPermitNoSamplingSQL((null as unknown) as IPostPermitNoSampling & PostCoordinatorData, 1);

    expect(response).to.be.null;
  });

  it('returns null when no systemUserId provided', () => {
    const response = postPermitNoSamplingSQL(data, null);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when all fields are passed in as expected', () => {
    const response = postPermitNoSamplingSQL(data, 1);

    expect(response).to.not.be.null;

    expect(response?.values.length).to.equal(7);

    expect(response?.values).to.deep.include('123');
    expect(response?.values).to.deep.include('first');
    expect(response?.values).to.deep.include('last');
    expect(response?.values).to.deep.include('email');
    expect(response?.values).to.deep.include('agency');
  });
});

describe('postProjectPermitSQL', () => {
  it('returns null when no permit number', () => {
    const response = postProjectPermitSQL((null as unknown) as string, 'type', 1, 1);

    expect(response).to.be.null;
  });

  it('returns null when no permit type', () => {
    const response = postProjectPermitSQL('123', (null as unknown) as string, 1, 1);

    expect(response).to.be.null;
  });

  it('returns null when no project id', () => {
    const response = postProjectPermitSQL('123', 'type', (null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null when no system user id', () => {
    const response = postProjectPermitSQL('123', 'type', 1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement when all fields are passed in as expected', () => {
    const response = postProjectPermitSQL('123', 'type', 123, 2);

    expect(response).to.not.be.null;
    expect(response?.values).to.deep.include('123');
  });
});
