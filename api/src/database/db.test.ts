import { expect } from 'chai';
import { describe } from 'mocha';
import * as pg from 'pg';
import Sinon from 'sinon';
import SQL from 'sql-template-strings';
import { SOURCE_SYSTEM, SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { ApiExecuteSQLError } from '../errors/api-error';
import { HTTPError } from '../errors/http-error';
import { DatabaseUserInformation, IdirUserInformation, KeycloakUserInformation } from '../utils/keycloak-utils';
import * as db from './db';
import {
  getAPIUserDBConnection,
  getDBConnection,
  getDBPool,
  getKnex,
  getServiceClientDBConnection,
  IDBConnection,
  initDBPool
} from './db';

describe('db', () => {
  beforeEach(() => {
    // reset singleton pg pool instance so that each test can control its existence as needed
    global['DBPool'] = undefined;
  });

  describe('getDBPool', () => {
    it('returns an undefined database pool instance if it has not yet been initialized', () => {
      const pool = getDBPool();

      expect(pool).to.be.undefined;
    });

    it('returns a defined database pool instance if it has been initialized', () => {
      initDBPool();

      const pool = getDBPool();

      expect(pool).not.to.be.undefined;
    });
  });

  describe('getDBConnection', () => {
    it('throws an error if keycloak token is undefined', () => {
      try {
        getDBConnection((null as unknown) as KeycloakUserInformation);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Keycloak token is undefined');
      }
    });

    it('returns a database connection instance', () => {
      const connection = getDBConnection({} as DatabaseUserInformation);

      expect(connection).not.to.be.null;
    });

    describe('DBConnection', () => {
      const sinonSandbox = Sinon.createSandbox();

      const mockKeycloakToken: IdirUserInformation = {
        idir_user_guid: 'testguid',
        identity_provider: 'idir',
        idir_username: 'testuser',
        email_verified: false,
        name: 'test user',
        preferred_username: 'testguid@idir',
        display_name: 'test user',
        given_name: 'test',
        family_name: 'user',
        email: 'email@email.com'
      };

      const queryStub = sinonSandbox.stub().resolves();
      const releaseStub = sinonSandbox.stub().resolves();
      const mockClient = { query: queryStub, release: releaseStub };
      const connectStub = sinonSandbox.stub().resolves(mockClient);
      const mockPool = { connect: connectStub };

      let connection: IDBConnection;

      beforeEach(() => {
        connection = getDBConnection(mockKeycloakToken);
      });

      afterEach(() => {
        sinonSandbox.restore();
      });

      describe('open', () => {
        describe('when not previously called', () => {
          it('opens a new connection, sets the user context, and sends a `BEGIN` query', async () => {
            const getDBPoolStub = sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            expect(getDBPoolStub).to.have.been.calledOnce;
            expect(connectStub).to.have.been.calledOnce;

            expect(queryStub).to.have.been.calledWith('BEGIN');
          });
        });

        describe('when previously called', () => {
          it('does nothing', async () => {
            const getDBPoolStub = sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            // call first time
            await connection.open();

            // reset mock call history
            queryStub.resetHistory();
            connectStub.resetHistory();

            // call second time
            await connection.open();

            expect(getDBPoolStub).to.have.been.calledOnce;

            expect(connectStub).not.to.have.been.called;
            expect(queryStub).not.to.have.been.called;
          });
        });

        describe('when the db pool has not been initialized', () => {
          it('throws an error', async () => {
            const getDBPoolStub = sinonSandbox.stub(db, 'getDBPool').returns(undefined);

            let expectedError: ApiExecuteSQLError;
            try {
              await connection.open();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as ApiExecuteSQLError;
            }

            expect(expectedError.message).to.equal('Failed to execute SQL');

            expect(expectedError.errors?.length).to.be.greaterThan(0);
            expectedError.errors?.forEach((item) => {
              expect(item).to.be.instanceOf(Error);
              if (item instanceof Error) {
                expect(item.message).to.be.eql('DBPool is not initialized');
              }
            });
            expect(getDBPoolStub).to.have.been.calledOnce;

            expect(connectStub).not.to.have.been.called;
            expect(queryStub).not.to.have.been.called;
          });
        });
      });

      describe('release', () => {
        describe('when a connection is open', () => {
          describe('when not previously called', () => {
            it('releases the open connection', async () => {
              sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

              await connection.open();

              connection.release();

              expect(releaseStub).to.have.been.calledOnce;
            });
          });

          describe('when previously called', () => {
            it('does not attempt to release a connection', async () => {
              sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

              await connection.open();

              // call first time
              connection.release();

              // reset mock call history
              releaseStub.resetHistory();

              // call second time
              connection.release();

              expect(releaseStub).not.to.have.been.called;
            });
          });
        });

        describe('when a connection is not open', () => {
          it('does not attempt to release a connection', async () => {
            connection.release();

            expect(releaseStub).not.to.have.been.called;
          });
        });
      });

      describe('commit', () => {
        describe('when a connection is open', () => {
          it('sends a `COMMIT` query', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            connection.commit();

            expect(queryStub).to.have.been.calledWith('COMMIT');
          });
        });

        describe('when a connection is not open', () => {
          it('throws an error', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            let expectedError: ApiExecuteSQLError;
            try {
              await connection.commit();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as ApiExecuteSQLError;
            }

            expect(expectedError.message).to.equal('Failed to execute SQL');

            expect(expectedError.errors?.length).to.be.greaterThan(0);
            expectedError.errors?.forEach((item) => {
              expect(item).to.be.instanceOf(Error);
              if (item instanceof Error) {
                expect(item.message).to.be.eql('DBConnection is not open');
              }
            });
          });
        });
      });

      describe('rollback', () => {
        describe('when a connection is open', () => {
          it('sends a `ROLLBACK` query', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            await connection.rollback();

            expect(queryStub).to.have.been.calledWith('ROLLBACK');
          });
        });

        describe('when a connection is not open', () => {
          it('throws an error', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            let expectedError: ApiExecuteSQLError;
            try {
              await connection.rollback();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as ApiExecuteSQLError;
            }

            expect(expectedError.message).to.equal('Failed to execute SQL');

            expect(expectedError.errors?.length).to.be.greaterThan(0);
            expectedError.errors?.forEach((item) => {
              expect(item).to.be.instanceOf(Error);
              if (item instanceof Error) {
                expect(item.message).to.be.eql('DBConnection is not open');
              }
            });
          });
        });
      });

      describe('query', () => {
        describe('when a connection is open', () => {
          it('sends a query with values', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            await connection.query('sql query', ['value1', 'value2']);

            expect(queryStub).to.have.been.calledWith('sql query', ['value1', 'value2']);
          });

          it('sends a query with empty values', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            await connection.query('sql query');

            expect(queryStub).to.have.been.calledWith('sql query', []);
          });
        });

        describe('when a connection is not open', () => {
          it('throws an error', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            let expectedError: ApiExecuteSQLError;
            try {
              await connection.query('sql query');

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as ApiExecuteSQLError;
            }

            expect(expectedError.message).to.equal('Failed to execute SQL');

            expect(expectedError.errors?.length).to.be.greaterThan(0);
            expectedError.errors?.forEach((item) => {
              expect(item).to.be.instanceOf(Error);
              if (item instanceof Error) {
                expect(item.message).to.be.eql('DBConnection is not open');
              }
            });
          });
        });
      });

      describe('sql', () => {
        describe('when a connection is open', () => {
          it('sends a sql statement', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            await connection.open();

            const sqlStatement = SQL`sql query ${123}`;

            await connection.sql(sqlStatement);

            expect(queryStub).to.have.been.calledWith('sql query $1', [123]);
          });
        });

        describe('when a connection is not open', () => {
          it('throws an error', async () => {
            sinonSandbox.stub(db, 'getDBPool').returns((mockPool as unknown) as pg.Pool);

            let expectedError: ApiExecuteSQLError;
            try {
              const sqlStatement = SQL`sql query ${123}`;

              await connection.sql(sqlStatement);

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as ApiExecuteSQLError;
            }
            expect(expectedError.message).to.equal('Failed to execute SQL');

            expect(expectedError.errors?.length).to.be.greaterThan(0);
            expectedError.errors?.forEach((item) => {
              expect(item).to.be.instanceOf(Error);
              if (item instanceof Error) {
                expect(item.message).to.be.eql('DBConnection is not open');
              }
            });
          });
        });
      });
    });
  });

  describe('getAPIUserDBConnection', () => {
    beforeEach(() => {
      process.env.DB_USER_API = 'example_db_username';
    });

    afterEach(() => {
      Sinon.restore();
    });

    it('calls getDBConnection for the biohub_api user', () => {
      const getDBConnectionStub = Sinon.stub(db, 'getDBConnection').returns(
        ('stubbed DBConnection object' as unknown) as IDBConnection
      );

      getAPIUserDBConnection();

      const DB_USERNAME = process.env.DB_USER_API;
      expect(getDBConnectionStub).to.have.been.calledWith({
        database_user_guid: DB_USERNAME,
        identity_provider: SYSTEM_IDENTITY_SOURCE.DATABASE.toLowerCase(),
        username: DB_USERNAME
      });
    });
  });

  describe('getServiceClientDBConnection', () => {
    beforeEach(() => {
      process.env.DB_USER_API = 'example_db_username';
    });

    afterEach(() => {
      Sinon.restore();
    });

    it('calls getDBConnection for the biohub_api user', () => {
      const getDBConnectionStub = Sinon.stub(db, 'getDBConnection').returns(
        ('stubbed DBConnection object' as unknown) as IDBConnection
      );

      const sourceSystem = SOURCE_SYSTEM['SIMS-SVC-4464'];

      getServiceClientDBConnection(sourceSystem);

      expect(getDBConnectionStub).to.have.been.calledWith({
        database_user_guid: sourceSystem,
        identity_provider: SYSTEM_IDENTITY_SOURCE.SYSTEM.toLowerCase(),
        username: `service-account-${sourceSystem}`
      });
    });
  });

  describe('getKnex', () => {
    it('returns a Knex instance', () => {
      const knex = getKnex();

      expect(knex.client.config).to.eql({ client: db.DB_CLIENT });
    });
  });
});
