create or replace procedure logic_template(p_param1 character varying , p_param2 character varying)
language plpgsql
as $$
declare
	C_PROCEDURE_NAME := 'some procedure';

begin
	
	biohubbc.sys_debug_write_debug('DEBUG: procedure entry ' || C_PROCEDURE_NAME || '.');
	-- enter your logic here
	biohubbc.sys_debug_write_debug('DEBUG: procedure exit ' || C_PROCEDURE_NAME || '.');
exception
	when others then
		biohubbc.sys_debug_write_session('ERROR: Others handler SQLSTATE = ' || sqlstate || '. SQLERRM: ' || sqlerrm || C_PROCEDURE_NAME)

end; $$