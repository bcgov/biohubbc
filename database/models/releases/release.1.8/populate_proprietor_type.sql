-- populate_proprietor_type.sql
insert into proprietor_type (name, record_effective_date, is_first_nation) values ('Awaiting Publication', now(), false);
insert into proprietor_type (name, record_effective_date, is_first_nation) values ('First Nations Land', now(), true);
insert into proprietor_type (name, record_effective_date, is_first_nation) values ('Private Land', now(), false);
