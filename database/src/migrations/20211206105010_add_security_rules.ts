import * as Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}]';
  set search_path = ${DB_SCHEMA},public;
  insert into  security_rule (name, rule_definition, system_rule, record_effective_date, description) values
    ('F-SACO: Bull Trout','[{"target":"occurrence","rule":"taxonid=''F-SACO''","project":""}]',FALSE,NOW(),'The data are about Bull Trout Spawning Areas Bull Trout spawning areas are at risk of poaching and should be automatically secured.'),
    ('R-PICA: Gopher Snake','[{"target":"occurrence","rule":"taxonid=''R-PICA''","project":""}]',FALSE,NOW(),'The data are about Gopher Snake Hibernacula Gopher Snake hibernacula are susceptible to persecution and should be automatically secured.'),
    ('R-PICA-CA: Gopher Snake','[{"target":"occurrence","rule":"taxonid=''R-PICA-CA''","project":""}]',FALSE,NOW(),'The data are about Gopher Snake Hibernacula Gopher Snake hibernacula are susceptible to persecution and should be automatically secured.'),
    ('R-PICA-DE: Gopher Snake','[{"target":"occurrence","rule":"taxonid=''R-PICA-DE''","project":""}]',FALSE,NOW(),'The data are about Gopher Snake Hibernacula Gopher Snake hibernacula are susceptible to persecution and should be automatically secured.'),
    ('R-COCO: North American Racer','[{"target":"occurrence","rule":"taxonid=''R-COCO''","project":""}]',FALSE,NOW(),'The data are about North American Racer Hibernacula North American Racer hibernacula are susceptible to persecution and should be automatically secured.'),
    ('R-CROR: Western Rattlesnake','[{"target":"occurrence","rule":"taxonid=''R-CROR''","project":""}]',FALSE,NOW(),'The data are about Western Rattlesnake Hibernacula Western Rattlesnake hibernacula are susceptible to persecution and should be automatically secured.'),
    ('M-MYKE: Keens Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYKE''","project":""}]',FALSE,NOW(),'The data are about Keens Myotis Hibernation and Maternity All Keens Myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYCA: Californian Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYCA''","project":""}]',FALSE,NOW(),'The data are about Californian Myotis Hibernation and Maternity Californian myotis winter hibernation sites and maternity roosts should be secured.'),
    ('M-MYCI: Western Small-footed Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYCI''","project":""}]',FALSE,NOW(),'The data are about Western Small-footed Myotis Hibernation and Maternity Western Small-footed myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYCI-ME: Western Small-footed Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYCI-ME''","project":""}]',FALSE,NOW(),'The data are about Western Small-footed Myotis Hibernation and Maternity Western Small-footed myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYEV: Long-eared Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYEV''","project":""}]',FALSE,NOW(),'The data are about Long-eared Myotis Hibernation and Maternity Long-eared Myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYLU: Little Brown Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYLU''","project":""}]',FALSE,NOW(),'The data are about Little Brown Myotis Hibernation and Maternity Little Brown Myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYSE: Northern Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYSE''","project":""}]',FALSE,NOW(),'The data are about Northern Myotis Hibernation and Maternity Northern Myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYTH: Fringed Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYTH''","project":""}]',FALSE,NOW(),'The data are about Fringed Myotis Hibernation and Maternity Fringed Myotis winter hibernation sites and maternity roosts should be secured.'),
    ('M-MYTH-TH: Fringed Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYTH-TH''","project":""}]',FALSE,NOW(),'The data are about Fringed Myotis Hibernation and Maternity Fringed Myotis winter hibernation sites and maternity roosts should be secured.'),
    ('M-MYVO: Long-legged Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYVO''","project":""}]',FALSE,NOW(),'The data are about Long-legged Myotis Hibernation and Maternity Long-legged myotis winter hibernation sites and maternity roosts should be secured'),
    ('M-MYYU: Yuma Myotis','[{"target":"occurrence","rule":"taxonid=''M-MYYU''","project":""}]',FALSE,NOW(),'The data are about Yuma Myotis Hibernation and Maternity Yuma Myotis winter hibernation sites and maternity roosts should be secured.'),
    ('M-LANO: Silver-haired bat','[{"target":"occurrence","rule":"taxonid=''M-LANO''","project":""}]',FALSE,NOW(),'The data are about Silver-haired bat Hibernation and Maternity Silver-haired bat winter hibernation sites and maternity roosts should be secured'),
    ('M-EPFU: Big Brown Bat','[{"target":"occurrence","rule":"taxonid=''M-EPFU''","project":""}]',FALSE,NOW(),'The data are about Big Brown Bat Hibernation and Maternity Data or information about the location of Big Brown Bat winter hibernation sites and maternity roosts'),
    ('M-COTO: Townsend''s Big-eared bat','[{"target":"occurrence","rule":"taxonid=''M-COTO''","project":""}]',FALSE,NOW(),'The data are about Townsend''s Big-eared bat Hibernation and Maternity Data or information about the location of Townsends Big-eared bat winter hibernation sites and maternity roosts.'),
    ('M-COTO-PA: Townsend''s Big-eared bat','[{"target":"occurrence","rule":"taxonid=''M-COTO-PA''","project":""}]',FALSE,NOW(),'The data are about Townsend''s Big-eared bat Hibernation and Maternity Data or information about the location of Townsends Big-eared bat winter hibernation sites and maternity roosts.'),
    ('M-COTO-TO: Townsend''s Big-eared bat','[{"target":"occurrence","rule":"taxonid=''M-COTO-TO''","project":""}]',FALSE,NOW(),'The data are about Townsend''s Big-eared bat Hibernation and Maternity Data or information about the location of Townsends Big-eared bat winter hibernation sites and maternity roosts.'),
    ('M-ANPA: Pallid Bat','[{"target":"occurrence","rule":"taxonid=''M-ANPA''","project":""}]',FALSE,NOW(),'The data are about Pallid Bat Hibernation and Maternity Data or information about the location of Pallid bat winter hibernation sites and maternity roosts.'),
    ('B-PEFA: Peregrine Falcon','[{"target":"occurrence","rule":"taxonid=''B-PEFA''","project":""}]',FALSE,NOW(),'The data are about Peregrine Falcon Nests Data or information about the location of nests of Peregrine Falcon'),
    ('B-PEFA-AN: Peregrine Falcon','[{"target":"occurrence","rule":"taxonid=''B-PEFA-AN''","project":""}]',FALSE,NOW(),'The data are about Peregrine Falcon Nests Data or information about the location of nests of Peregrine Falcon'),
    ('B-PEFA-PE: Peregrine Falcon','[{"target":"occurrence","rule":"taxonid=''B-PEFA-PE''","project":""}]',FALSE,NOW(),'The data are about Peregrine Falcon Nests Data or information about the location of nests of Peregrine Falcon'),
    ('B-PEFA-TU: Peregrine Falcon','[{"target":"occurrence","rule":"taxonid=''B-PEFA-TU''","project":""}]',FALSE,NOW(),'The data are about Peregrine Falcon Nests Data or information about the location of nests of Peregrine Falcon'),
    ('B-PRFA: Prairie Falcon','[{"target":"occurrence","rule":"taxonid=''B-PRFA''","project":""}]',FALSE,NOW(),'The data are about Prairie Falcon Nests Data or information about the location of nests of Prairie Falcon.'),
    ('B-GYRF: Gyrfalcon','[{"target":"occurrence","rule":"taxonid=''B-GYRF''","project":""}]',FALSE,NOW(),'The data are about Gyrfalcon Nests Gyrfalcon nest locations should all be secured.'),
    ('B-GYRF-OB: Gyrfalcon','[{"target":"occurrence","rule":"taxonid=''B-GYRF-OB''","project":""}]',FALSE,NOW(),'The data are about Gyrfalcon Nests Gyrfalcon nest locations should all be secured.'),
    ('B-GYRF-UR: Gyrfalcon','[{"target":"occurrence","rule":"taxonid=''B-GYRF-UR''","project":""}]',FALSE,NOW(),'The data are about Gyrfalcon Nests Gyrfalcon nest locations should all be secured.'),
    ('B-STGR: Sharp-tailed Grouse','[{"target":"occurrence","rule":"taxonid=''B-STGR''","project":""}]',FALSE,NOW(),'The data are about Sharp-tailed Grouse Leks Data or information about the location of leks of Sharp-tailed Grouse'),
    ('B-STGR-CO: Sharp-tailed Grouse','[{"target":"occurrence","rule":"taxonid=''B-STGR-CO''","project":""}]',FALSE,NOW(),'The data are about Sharp-tailed Grouse Leks Data or information about the location of leks of Sharp-tailed Grouse');

  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set schema '${DB_SCHEMA}]';
  set search_path = ${DB_SCHEMA},public;

  delete from  ${DB_SCHEMA}.security_rule where system_rule = true;

  `);
}
