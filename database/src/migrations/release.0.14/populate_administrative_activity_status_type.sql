-- administrative_activity_status_type.sql
insert into administrative_activity_status_type (name, record_effective_date, description) values ('Pending', now(), '');
insert into administrative_activity_status_type (name, record_effective_date, description) values ('Actioned', now(), '');
insert into administrative_activity_status_type (name, record_effective_date, description) values ('Rejected', now(), '');
