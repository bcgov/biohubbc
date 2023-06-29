import chai from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

describe('DraftRepository', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('deleteDraft', () => {});
  describe('getDraft', () => {});
  describe('getDraftList', () => {});
  describe('createDraft', () => {});
  describe('updateDraft', () => {});
});
