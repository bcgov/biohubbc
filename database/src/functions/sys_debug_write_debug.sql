-----------------------------------------------------
-- How to use:
-- call biohubbc.sys_debug_set_debug_on();
-- select biohubbc.sys_debug_write_debug('msg');
-----------------------------------------------------


create or replace function biohubbc.sys_debug_write_debug(p_log_message character varying)
returns void
language plpgsql
as
$$
declare
    v_debug_status boolean;
begin   
	select coalesce(current_setting('biohubbc.debug_status', true)::boolean,false) into v_debug_status;
	
    if v_debug_status then  
		insert into biohubbc.debug_log (session_id, create_at, message) 
		values (pg_backend_pid(), now() , p_log_message);
	end if;
exception when others then
	perform biohubbc.sys_debug_write_session('DB function sys_debug_write_debug.  SQLSTATE:' || sqlstate || '. SQLERRM: ' || sqlerrm);
end;
$$;