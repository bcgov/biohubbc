--------------------
-- To use:
-- select biohubbc.sys_debug_view_session_debug_log();
--------------------
create or replace function biohubbc.sys_debug_view_session_debug_log()
returns void
language plpgsql
as
$$

declare 
	r record;

begin   
	for r in 
		select * from biohubbc.debug_log sl where session_id = pg_backend_pid()
	loop
		raise notice '%', r.message;
	end loop;
	
exception when others then
	perform biohubbc.sys_debug_write_session('ERROR: Others handler SQLSTATE = ' || sqlstate || '. SQLERRM: ' || sqlerrm || ' Function name: db_view_session_debug_log' || '.');
end;
$$;