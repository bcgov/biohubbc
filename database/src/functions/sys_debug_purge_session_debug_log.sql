--------------------
-- To use:
-- call biohubbc.sys_debug_purge_session_debug_log(session_id);
--------------------

create or replace procedure biohubbc.sys_debug_purge_session_debug_log(p_session_id integer)
language plpgsql
as
$$


begin   
	delete from biohubbc.debug_log where session_id = p_session_id;
	
exception when others then
	perform biohubbc.sys_debug_write_session('ERROR: Others handler SQLSTATE = ' || sqlstate || '. SQLERRM: ' || sqlerrm || ' Function name: db_purge_session_debug_log' || '.');
end;
$$;