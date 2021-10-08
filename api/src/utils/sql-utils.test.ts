import { expect } from 'chai';
import { describe } from 'mocha';
import SQL, { SQLStatement } from 'sql-template-strings';
import { appendSQLColumns, appendSQLColumnsEqualValues, appendSQLValues } from './sql-utils';

describe('appendSQLColumnsEqualValues', () => {
  it('appends nothing when empty array provided', async () => {
    const sqlStatement: SQLStatement = SQL`UPDATE table SET`;

    appendSQLColumnsEqualValues(sqlStatement, []);

    expect(sqlStatement.text).to.equal('UPDATE table SET');
    expect(sqlStatement.values).to.eql([]);
  });

  it('appends a column name and value to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`UPDATE table SET`;

    appendSQLColumnsEqualValues(sqlStatement, [{ columnName: 'col1', columnValue: 'col1value' }]);

    expect(sqlStatement.text).to.equal('UPDATE table SET col1 = $1');
    expect(sqlStatement.values).to.eql(['col1value']);
  });

  it('appends multiple column names and values to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`UPDATE table SET`;

    appendSQLColumnsEqualValues(sqlStatement, [
      { columnName: 'col1', columnValue: 'col1value' },
      { columnName: 'col2', columnValue: 'col2value' },
      { columnName: 'col3', columnValue: 'col3value' }
    ]);

    expect(sqlStatement.text).to.equal('UPDATE table SET col1 = $1, col2 = $2, col3 = $3');
    expect(sqlStatement.values).to.eql(['col1value', 'col2value', 'col3value']);
  });
});

describe('appendSQLColumns', () => {
  it('appends nothing when empty array provided', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id,`;

    appendSQLColumns(sqlStatement, []);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id,');
    expect(sqlStatement.values).to.eql([]);
  });

  it('appends a column name to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id,`;

    appendSQLColumns(sqlStatement, [{ columnName: 'col1' }]);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id, col1');
    expect(sqlStatement.values).to.eql([]);
  });

  it('appends multiple column names to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id,`;

    appendSQLColumns(sqlStatement, [{ columnName: 'col1' }, { columnName: 'col2' }, { columnName: 'col3' }]);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id, col1, col2, col3');
    expect(sqlStatement.values).to.eql([]);
  });
});

describe('appendSQLValues', () => {
  it('appends nothing when empty array provided', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id,`;

    appendSQLValues(sqlStatement, []);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id,');
    expect(sqlStatement.values).to.eql([]);
  });

  it('appends a column value to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id, col1) VALUES (${123},`;

    appendSQLValues(sqlStatement, [{ columnValue: 'col1value' }]);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id, col1) VALUES ($1, $2');
    expect(sqlStatement.values).to.eql([123, 'col1value']);
  });

  it('appends multiple column values to the sql statement', async () => {
    const sqlStatement: SQLStatement = SQL`INSERT INTO table (id, col1, col2, col3) VALUES (${123},`;

    appendSQLValues(sqlStatement, [
      { columnValue: 'col1value' },
      { columnValue: 'col2value' },
      { columnValue: 'col3value' }
    ]);

    expect(sqlStatement.text).to.equal('INSERT INTO table (id, col1, col2, col3) VALUES ($1, $2, $3, $4');
    expect(sqlStatement.values).to.eql([123, 'col1value', 'col2value', 'col3value']);
  });
});
