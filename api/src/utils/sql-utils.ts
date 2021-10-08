import SQL, { SQLStatement } from 'sql-template-strings';

export type AppendSQLColumnsEqualValues = AppendSQLColumn & AppendSQLValue;

export type AppendSQLColumn = {
  columnName: string;
};

export type AppendSQLValue = {
  columnValue: any;
};

export const appendSQLColumnsEqualValues = (
  sqlStatement: SQLStatement,
  items: AppendSQLColumnsEqualValues[]
): SQLStatement => {
  if (!items || !items.length) {
    // no items, return sql statement unchanged
    return sqlStatement;
  }

  // append the first column
  sqlStatement.append(` ${items[0].columnName} = `);
  sqlStatement.append(SQL`${items[0].columnValue}`);

  // append all subsequent columns
  if (items.length > 1) {
    for (let i = 1; i < items.length; i++) {
      sqlStatement.append(`, ${items[i].columnName} = `);
      sqlStatement.append(SQL`${items[i].columnValue}`);
    }
  }

  return sqlStatement;
};

export const appendSQLColumns = (sqlStatement: SQLStatement, items: AppendSQLColumn[]): SQLStatement => {
  if (!items || !items.length) {
    // no items, return sql statement unchanged
    return sqlStatement;
  }

  // append the first column
  sqlStatement.append(` ${items[0].columnName}`);

  // append all subsequent columns
  if (items.length > 1) {
    for (let i = 1; i < items.length; i++) {
      sqlStatement.append(`, ${items[i].columnName}`);
    }
  }

  return sqlStatement;
};

export const appendSQLValues = (sqlStatement: SQLStatement, items: AppendSQLValue[]): SQLStatement => {
  if (!items || !items.length) {
    // no items, return sql statement unchanged
    return sqlStatement;
  }

  // append the first value
  sqlStatement.append(SQL` ${items[0].columnValue}`);

  // append all subsequent values
  if (items.length > 1) {
    for (let i = 1; i < items.length; i++) {
      sqlStatement.append(SQL`, ${items[i].columnValue}`);
    }
  }

  return sqlStatement;
};
