-- populate_climate_change_initiatives.sql
insert into biohub.climate_change_initiative (name, record_effective_date) VALUES ('Adaptation', now());
insert into climate_change_initiative (name, record_effective_date) VALUES ('Monitoring', now());
insert into climate_change_initiative (name, record_effective_date) VALUES ('Mitigation', now());