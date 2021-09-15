import { expect } from 'chai';
import { describe } from 'mocha';
import {
  getProjectAttachmentsSQL,
  deleteProjectAttachmentSQL,
  getProjectAttachmentS3KeySQL,
  postProjectAttachmentSQL,
  getProjectAttachmentByFileNameSQL,
  putProjectAttachmentSQL,
  applyProjectAttachmentSecurityRuleSQL,
  addProjectAttachmentSecurityRuleSQL,
  getProjectAttachmentSecurityRuleSQL,
  removeProjectAttachmentSecurityTokenSQL,
  removeSecurityRecordSQL
} from './project-attachments-queries';

describe('getProjectAttachmentsSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentsSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectAttachmentsSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('applyProjectAttachmentSecurityRuleSQL', () => {
  it('returns null response when null securityRuleId provided', () => {
    const response = applyProjectAttachmentSecurityRuleSQL(null);

    expect(response).to.be.null;
  });

  it('returns non null response when valid securityRuleId provided', () => {
    const response = applyProjectAttachmentSecurityRuleSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('addProjectAttachmentSecurityRuleSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = addProjectAttachmentSecurityRuleSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = addProjectAttachmentSecurityRuleSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentSecurityRuleSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentSecurityRuleSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId provided', () => {
    const response = getProjectAttachmentSecurityRuleSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('removeProjectAttachmentSecurityTokenSQL', () => {
  it('returns null response when null attachmentId provided', () => {
    const response = removeProjectAttachmentSecurityTokenSQL((null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid attachmentId provided', () => {
    const response = removeProjectAttachmentSecurityTokenSQL(1);

    expect(response).to.not.be.null;
  });
});

describe('removeSecurityRecordSQL', () => {
  it('returns null response when null securityToken provided', () => {
    const response = removeSecurityRecordSQL(null);

    expect(response).to.be.null;
  });

  it('returns non null response when valid securityToken provided', () => {
    const response = removeSecurityRecordSQL('token123');

    expect(response).to.not.be.null;
  });
});

describe('deleteProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = deleteProjectAttachmentSQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = deleteProjectAttachmentSQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentS3KeySQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentS3KeySQL((null as unknown) as number, 1);

    expect(response).to.be.null;
  });

  it('returns null response when null attachmentId provided', () => {
    const response = getProjectAttachmentS3KeySQL(1, (null as unknown) as number);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and attachmentId provided', () => {
    const response = getProjectAttachmentS3KeySQL(1, 2);

    expect(response).to.not.be.null;
  });
});

describe('postProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = postProjectAttachmentSQL('name', 20, (null as unknown) as number, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = postProjectAttachmentSQL((null as unknown) as string, 20, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', (null as unknown) as number, 1, 'key');

    expect(response).to.be.null;
  });

  it('returns null response when null key provided', () => {
    const response = postProjectAttachmentSQL('name', (null as unknown) as number, 1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName and fileSize provided', () => {
    const response = postProjectAttachmentSQL('name', 20, 1, 'key');

    expect(response).to.not.be.null;
  });
});

describe('getProjectAttachmentByFileNameSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = getProjectAttachmentByFileNameSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = getProjectAttachmentByFileNameSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});

describe('putProjectAttachmentSQL', () => {
  it('returns null response when null projectId provided', () => {
    const response = putProjectAttachmentSQL((null as unknown) as number, 'name');

    expect(response).to.be.null;
  });

  it('returns null response when null fileName provided', () => {
    const response = putProjectAttachmentSQL(1, (null as unknown) as string);

    expect(response).to.be.null;
  });

  it('returns non null response when valid projectId and fileName provided', () => {
    const response = putProjectAttachmentSQL(1, 'name');

    expect(response).to.not.be.null;
  });
});
