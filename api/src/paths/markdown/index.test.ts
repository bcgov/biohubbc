import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { getMarkdownByTypeName } from '.';
import { getMockDBConnection, getRequestHandlerMocks } from '../../__mocks__/db';
import * as db from '../../database/db';
import { HTTPError } from '../../errors/http-error';
import { MarkdownService } from '../../services/markdown-service';
import { KeycloakUserInformation } from '../../utils/keycloak-utils';

chai.use(sinonChai);

describe('getMarkdown', () => {
  afterEach(() => {
    sinon.restore();
  });

  it('successfully retrieves markdown', async () => {
    const mockMarkdownResponse = {
      markdown_id: 1,
      markdown_type_id: 1,
      data: 'Sample markdown content',
      participated: false
    };

    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getMarkdownStub = sinon
      .stub(MarkdownService.prototype, 'getMarkdownByTypeName')
      .resolves(mockMarkdownResponse);

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { typeName: 'help' };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = getMarkdownByTypeName();

    await requestHandler(mockReq, mockRes, mockNext);

    expect(mockDBConnection.open).to.have.been.calledOnce;
    expect(mockDBConnection.commit).to.have.been.calledOnce;
    expect(getMarkdownStub).to.have.been.calledOnceWith({
      markdown_type_name: 'help',
      system_user_id: 20
    });
    expect(mockRes.jsonValue.markdown).to.eql(mockMarkdownResponse);
    expect(mockDBConnection.release).to.have.been.calledOnce;
  });

  it('handles errors gracefully', async () => {
    const mockDBConnection = getMockDBConnection({
      open: sinon.stub(),
      commit: sinon.stub(),
      rollback: sinon.stub(),
      release: sinon.stub(),
      systemUserId: () => 20
    });

    sinon.stub(db, 'getDBConnection').returns(mockDBConnection);

    const getMarkdownStub = sinon
      .stub(MarkdownService.prototype, 'getMarkdownByTypeName')
      .rejects(new Error('a test error'));

    const { mockReq, mockRes, mockNext } = getRequestHandlerMocks();
    mockReq.query = { typeName: 'help' };
    mockReq.keycloak_token = {} as KeycloakUserInformation;

    const requestHandler = getMarkdownByTypeName();

    try {
      await requestHandler(mockReq, mockRes, mockNext);
      expect.fail('Expected error was not thrown');
    } catch (actualError) {
      expect(mockDBConnection.open).to.have.been.calledOnce;
      expect(getMarkdownStub).to.have.been.calledOnceWith({
        markdown_type_name: 'help',
        system_user_id: 20
      });
      expect(mockDBConnection.rollback).to.have.been.calledOnce;
      expect(mockDBConnection.release).to.have.been.calledOnce;

      expect((actualError as HTTPError).message).to.equal('a test error');
    }
  });
});
