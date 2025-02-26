import { expect } from 'chai';
import { getAllAliases } from './csv-helpers';

describe('getAllAliases', () => {
  it('returns empty array when no aliases provided', () => {
    const aliases = getAllAliases([]);

    expect(aliases).to.be.an('array').that.is.empty;
  });

  it('handles converting underscores to spaces', () => {
    const aliases = getAllAliases(['ALIAS', 'ALIAS_2']);

    expect(aliases).to.deep.equal(['ALIAS', 'ALIAS_2', 'ALIAS 2']);
  });

  it('handles converting spaces to underscores', () => {
    const aliases = getAllAliases(['ALIAS', 'ALIAS 2']);

    expect(aliases).to.deep.equal(['ALIAS', 'ALIAS 2', 'ALIAS_2']);
  });

  it('handles both spaces and underscores with no duplicates', () => {
    const aliases = getAllAliases(['ALIAS', 'ALIAS 2', 'ALIAS_2']);

    expect(aliases).to.deep.equal(['ALIAS', 'ALIAS 2', 'ALIAS_2']);
  });

  it('handles aliases with both spaces and underscores', () => {
    const aliases = getAllAliases(['ALIAS_2 OTHER']);

    expect(aliases).to.deep.equal(['ALIAS_2 OTHER', 'ALIAS_2_OTHER', 'ALIAS 2 OTHER']);
  });
});
