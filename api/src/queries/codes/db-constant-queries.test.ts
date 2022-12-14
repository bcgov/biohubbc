import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getDbCharacterSystemConstantSQL,
  getDbCharacterSystemMetaDataConstantSQL,
  getDbNumericSystemConstantSQL,
  getDbNumericSystemMetaDataConstantSQL
} from './db-constant-queries';

describe('getDbCharacterSystemConstantSQL', () => {
  it('returns valid sql statement', () => {
    const response = getDbCharacterSystemConstantSQL('string');
    expect(response).to.not.be.null;
  });
});

describe('getDbNumericSystemConstantSQL', () => {
  it('returns valid sql statement', () => {
    const response = getDbNumericSystemConstantSQL('string');
    expect(response).to.not.be.null;
  });
});

describe('getDbCharacterSystemMetaDataConstantSQL', () => {
  it('returns valid sql statement', () => {
    const response = getDbCharacterSystemMetaDataConstantSQL('string');
    expect(response).to.not.be.null;
  });
});

describe('getDbNumericSystemMetaDataConstantSQL', () => {
  it('returns valid sql statement', () => {
    const response = getDbNumericSystemMetaDataConstantSQL('string');
    expect(response).to.not.be.null;
  });
});
