-- populate_summary_submission_message_class.sql

insert into summary_submission_message_class (name, record_effective_date, description) values ('Notice', now(), 'An informal notification message.');
insert into summary_submission_message_class (name, record_effective_date, description) values ('Error', now(), 'An error message.');
insert into summary_submission_message_class (name, record_effective_date, description) values ('Warning', now(), 'An warning message.');