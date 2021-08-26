-- populate_project_role.sql
insert into project_role (name, record_effective_date, description) values ('Project Lead', now(), 'The administrative lead of the project.');
insert into project_role (name, record_effective_date, description) values ('Project Team Member', now(), 'A participant team member of the project.');
insert into project_role (name, record_effective_date, description) values ('Project Reviewer', now(), 'A reviewer of the project.');