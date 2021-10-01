import { expect } from 'chai';
import { describe } from 'mocha';
import { unsecureAttachmentRecordSQL, secureAttachmentRecordSQL } from './security-queries';

describe('unsecureAttachmentRecordSQL', () => {
  it('returns null when no tableName provided', () => {
    const response = unsecureAttachmentRecordSQL((null as unknown) as string, 'token');

    expect(response).to.be.null;
  });

  it('returns null when no securityToken provided', () => {
    const response = unsecureAttachmentRecordSQL('table', (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement', () => {
    const response = unsecureAttachmentRecordSQL('table', 'token');

    expect(response).to.not.be.null;
  });
});

describe('secureAttachmentRecordSQL', () => {
  it('returns null when no attachmentId provided', () => {
    const response = secureAttachmentRecordSQL((null as unknown) as number, 'table', 1);

    expect(response).to.be.null;
  });

  it('returns null when no tableName provided', () => {
    const response = secureAttachmentRecordSQL(1, (null as unknown) as string, 1);

    expect(response).to.be.null;
  });

  it('returns null when no projectId provided', () => {
    const response = secureAttachmentRecordSQL(1, 'table', (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns a SQLStatement', () => {
    const response = secureAttachmentRecordSQL(1, 'table', 3);

    expect(response).to.not.be.null;
  });
});
