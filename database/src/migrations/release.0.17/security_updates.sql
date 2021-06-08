-- security_updates.sql
ALTER TABLE activity ADD COLUMN security_token uuid;
COMMENT ON COLUMN activity.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX act_sec_idx ON activity(security_token);

ALTER TABLE project ADD COLUMN security_token uuid;
COMMENT ON COLUMN project.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX pr_sec_idx ON project(security_token);

ALTER TABLE project_activity ADD COLUMN security_token uuid;
COMMENT ON COLUMN project_activity.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX pra_sec_idx ON project_activity(security_token);

ALTER TABLE project_attachment ADD COLUMN security_token uuid;
COMMENT ON COLUMN project_attachment.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX prat_sec_idx ON project_attachment(security_token);

ALTER TABLE survey ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX su_sec_idx ON survey(security_token);

ALTER TABLE survey_attachment ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey_attachment.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX suat_sec_idx ON survey_attachment(security_token);

ALTER TABLE survey_occurrence ADD COLUMN security_token uuid;
COMMENT ON COLUMN survey_occurrence.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX suoc_sec_idx ON survey_occurrence(security_token);

ALTER TABLE webform_draft ADD COLUMN security_token uuid;
COMMENT ON COLUMN webform_draft.security_token IS 'The token indicates that this is a non-public row and it will trigger activation of the security rules defined for this row.';
CREATE UNIQUE INDEX wf_sec_idx ON webform_draft(security_token);
