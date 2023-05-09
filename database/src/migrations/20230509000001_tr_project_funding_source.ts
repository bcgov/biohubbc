import { Knex } from 'knex';

/**
 * Apply biohub release changes.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path=biohub;

  create or replace function tr_project_funding_source() returns trigger
  language plpgsql
  security invoker
  as
  $$
  -- *******************************************************************
  -- Procedure: tr_project_funding_source
  -- Purpose: performs specific data validation
  --
  -- MODIFICATION HISTORY
  -- Person           Date        Comments
  -- ---------------- ----------- --------------------------------------
  -- charlie.garrettjones@quartech.com
  --                  2021-01-03  initial release
  -- charlie.garrettjones@quartech.com
  --                  2023-04-17  BHBC-2297 adjustment to accommodate first nations
  -- charlie.garrettjones@quartech.com
  --                  2023-05-09  SIMSBIOHUB-24 test for required funding dates when not associated with first nations
  -- *******************************************************************
  declare
    _project_id_optional funding_source.project_id_optional%type;
  begin
    -- ensure funding source is related to an investment action category or first nation
    if (((new.investment_action_category_id is null) and (new.first_nations_id is null)) or ((new.investment_action_category_id is not null) and (new.first_nations_id is not null))) then
      raise exception 'Funding source must be related to either an investment action category or a first nation.';
    end if;
  
    -- query funding source to determine optionality of funding source project id when related to investment action category
    if ((new.investment_action_category_id is not null) and (new.funding_source_project_id is null)) then    
      select project_id_optional into _project_id_optional from funding_source
        where funding_source_id = (select funding_source_id from investment_action_category where investment_action_category_id = new.investment_action_category_id);
  
      if not _project_id_optional then
        raise exception 'The funding source project id is not optional for the selected funding source.';
      end if;
    end if;

    -- ensure funding dates are supplied when not associated with first nations
    if ((new.first_nations_id is null) and ((new.funding_start_date is null) or (new.funding_end_date is null))) then 
      raise exception 'The funding start and end dates are not optional.';
    end if;

    return new;
  end;
  $$;
  
  drop trigger if exists project_funding_source_val on biohub.project_funding_source;
  create trigger project_funding_source_val before insert or update on biohub.project_funding_source for each row execute procedure tr_project_funding_source();
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(``);
}
