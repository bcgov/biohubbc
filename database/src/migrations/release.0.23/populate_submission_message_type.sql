-- populate_submission_message_type.sql

-- term related
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Duplicate Header', now(), 'A duplicate header term was detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Unknown Header', now(), 'An unknown header term was detected.', (select submission_message_class_id from submission_message_class where name = 'Warning'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Missing Required Header', now(), 'A required header term was not detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Missing Recommended Header', now(), 'A recommended header term was detected.', (select submission_message_class_id from submission_message_class where name = 'Warning'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Miscellaneous', now(), 'A (temporary) miscellaneous header/row term was detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));



-- field related
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Missing Required Field', now(), 'A required field was not detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Unexpected Format', now(), 'A field with an unexpected format was detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Format Warning', now(), 'A field with an unexpected format was detected.', (select submission_message_class_id from submission_message_class where name = 'Warning'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Out of Range', now(), 'A field with an out of range value was detected.', (select submission_message_class_id from submission_message_class where name = 'Error'));
insert into submission_message_type (name, record_effective_date, description, submission_message_class_id) values ('Invalid Value', now(), 'A field with a value not from the prescribed list.', (select submission_message_class_id from submission_message_class where name = 'Error'));
