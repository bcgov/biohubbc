import chai, { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as validate from './validate';
import * as media_utils from '../../utils/media/media-utils';

chai.use(sinonChai);

describe('prepXLSX', () => {
  const sampleReq = {
    keycloak_token: {},
    s3File: {
      fieldname: 'media',
      originalname: 'test.txt',
      encoding: '7bit',
      mimetype: 'text/plain',
      size: 340
    }
  } as any;

  afterEach(() => {
    sinon.restore();
  });

  it('should set parseError when failed to parse s3File', async () => {
    const nextSpy = sinon.spy();

    sinon.stub(media_utils, 'parseUnknownMedia').returns(null);

    const result = validate.prepXLSX();
    await result(sampleReq, (null as unknown) as any, nextSpy as any);

    expect(sampleReq.parseError).to.eql('Failed to parse submission, file was empty');
    expect(nextSpy).to.have.been.called;
  });
});
