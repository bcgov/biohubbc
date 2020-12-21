-----------------------------------------------------
-- How to use:
-- call biohubbc.sys_debug_set_debug_on();
-- select biohubbc.sys_debug_write_session('msg');
-----------------------------------------------------

create or replace function biohubbc.sys_debug_write_session(p_log_message character varying)
returns boolean
language plpgsql
as
$$

declare v_flag boolean := false;
    
begin
		insert into biohubbc.session_log (session_id, create_at, message) 
		values (pg_backend_pid(), now() , p_log_message);
		v_flag = true;
	
		return v_flag;
exception when others then
	raise notice 'biohubbc.sys_debug_write_session: caught exception sqlstate: % , sqlerrm: % ' , sqlstate , sqlerrm ;

	return v_flag;
end;
$$;