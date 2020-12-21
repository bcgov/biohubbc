
--------------------
-- To use:
-- call biohubbc.sys_debug_set_debug_off();
---------------------

create or replace procedure biohubbc.sys_debug_set_debug_off()
language plpgsql
as
$$
    
begin   
	set biohubbc.debug_status = false ;
end;
$$;