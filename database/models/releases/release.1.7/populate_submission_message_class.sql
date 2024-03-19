-- populate_submission_message_class.sql

insert into submission_message_class (name, record_effective_date, description) values ('Notice', now(), 'An informal notification message.');
insert into submission_message_class (name, record_effective_date, description) values ('Error', now(), 'An error message.');
insert into submission_message_class (name, record_effective_date, description) values ('Warning', now(), 'An warning message.');