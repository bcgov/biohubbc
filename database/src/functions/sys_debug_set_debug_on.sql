
--------------------
-- To use:
-- call biohubbc.sys_debug_set_debug_on();
---------------------


create or replace procedure biohubbc.sys_debug_set_debug_on()
language plpgsql
as
$$
    
begin   
	set biohubbc.debug_status = true ;
end;
$$;