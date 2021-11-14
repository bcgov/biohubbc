import { SQL, SQLStatement } from 'sql-template-strings';

export const getDbCharacterSystemConstantSQL = (constantName: string): SQLStatement =>
  SQL`SELECT api_get_character_system_constant(${constantName}) as constant;`;

export const getDbNumericSystemConstantSQL = (constantName: string): SQLStatement =>
  SQL`SELECT api_get_numeric_system_constant(${constantName}) as constant;`;

export const getDbCharacterSystemMetaDataConstantSQL = (constantName: string): SQLStatement =>
  SQL`SELECT api_get_character_system_metadata_constant(${constantName}) as constant;`;

export const getDbNumericSystemMetaDataConstantSQL = (constantName: string): SQLStatement =>
  SQL`SELECT api_get_numeric_system_metadata_constant(${constantName}) as constant;`;
