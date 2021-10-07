-- populate_summary_submission_message_type.sql

-- term related
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Duplicate Header', now(), 'A duplicate header term was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Unknown Header', now(), 'An unknown header term was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Warning'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Missing Required Header', now(), 'A required header term was not detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Missing Recommended Header', now(), 'A recommended header term was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Warning'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Miscellaneous', now(), 'A (temporary) miscellaneous header/row term was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));



-- field related
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Missing Required Field', now(), 'A required field was not detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Unexpected Format', now(), 'A field with an unexpected format was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Out of Range', now(), 'A field with an out of range value was detected.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));
insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Invalid Value', now(), 'A field with a value not from the prescribed list.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));

-- template validation related

insert into summary_submission_message_type (name, record_effective_date, description, summary_submission_message_class_id) values ('Missing Validation Schema', now(), 'Query is unable to fetch validation schema.', (select summary_submission_message_class_id from summary_submission_message_class where name = 'Error'));

