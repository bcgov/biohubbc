create or replace function logic_template(p_param1 character varying , p_param2 character varying) returns boolean

language plpgsql
as $$
declare
	C_FUNCTION_NAME := 'some function';
	v_flag boolean := false;

begin
	
	biohubbc.sys_debug_write_debug('DEBUG: function entry ' || C_FUNCTION_NAME || '.');
	-- enter your logic here
	biohubbc.sys_debug_write_debug('DEBUG: function exit ' || C_FUNCTION_NAME || '.');
	v_flag = true;

	return v_flag;
exception
	when others then
		biohubbc.sys_debug_write_session('ERROR: Others handler SQLSTATE = ' || sqlstate || '. SQLERRM: ' || sqlerrm || C_FUNCTION_NAME);
		
		return v_flag;
end; $$