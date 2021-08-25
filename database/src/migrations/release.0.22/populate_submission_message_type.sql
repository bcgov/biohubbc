-- populate_submission_message_type.sql

insert into submission_message_type (name, record_effective_date, description) values ('Notice', now(), 'An informal notification message.');
insert into submission_message_type (name, record_effective_date, description) values ('Error', now(), 'An error message.');
insert into submission_message_type (name, record_effective_date, description) values ('Warning', now(), 'A warning message.');
