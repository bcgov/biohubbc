-- populate_submission_status_type.sql

insert into submission_status_type (name, record_effective_date, description) values ('Submitted', now(), 'Submitted for processing.');
insert into submission_status_type (name, record_effective_date, description) values ('Template Validated', now(), 'The submission input template has been validated.');
insert into submission_status_type (name, record_effective_date, description) values ('Darwin Core Validated', now(), 'Darwin Core validation has completed.');
insert into submission_status_type (name, record_effective_date, description) values ('BioHub Validated', now(), 'BioHub validation has completed.');
insert into submission_status_type (name, record_effective_date, description) values ('Submission Data Ingested', now(), 'Submission data has been ingested.');
insert into submission_status_type (name, record_effective_date, description) values ('Secured', now(), 'The submission has had security applied.');
insert into submission_status_type (name, record_effective_date, description) values ('Awaiting Curration', now(), 'The submission is awaiting curration.');
insert into submission_status_type (name, record_effective_date, description) values ('Published', now(), 'The submission has been publised.');
insert into submission_status_type (name, record_effective_date, description) values ('Rejected', now(), 'The submission has been rejected.');
insert into submission_status_type (name, record_effective_date, description) values ('On Hold', now(), 'Submission processing has been placed on hold.');
insert into submission_status_type (name, record_effective_date, description) values ('System Error', now(), 'The validation process has not started.');
