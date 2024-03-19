-- populate_system_constant.sql

-- survey states
insert into system_constant (constant_name, character_value, description) values ('SURVEY_STATE_PUBLISHED', 'Published', 'The survey state name that indicates that the data has been published and is discoverable.');
-- system roles
insert into system_constant (constant_name, character_value, description) values ('SYSTEM_ROLES_SYSTEM_ADMINISTRATOR', 'System Administrator', 'The system role name that defines a system administrator role.');