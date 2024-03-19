-- populate_user_identity_source.sql
delete from system_user;
delete from user_identity_source;

insert into user_identity_source(name, record_effective_date, description, create_date, create_user) values ('DATABASE', now(), 'DATABASE user source system.', now(), 1);
insert into user_identity_source(name, record_effective_date, description, create_date, create_user) values ('IDIR', now(), 'IDIR user source system.', now(), 1);
insert into user_identity_source(name, record_effective_date, description, create_date, create_user) values ('BCEID', now(), 'BCEID user source system.', now(), 1);

insert into system_user (uis_id, user_identifier, record_effective_date, create_date, create_user)
  select id, 'postgres', now(), now(), 1 from user_identity_source 
    where name = 'DATABASE'
    and record_end_date is null;
    
