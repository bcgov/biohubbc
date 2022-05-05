import { expect } from 'chai';
import { describe } from 'mocha';
import * as pg from 'pg';
import Sinon from 'sinon';
import { SYSTEM_IDENTITY_SOURCE } from '../constants/database';
import { HTTPError } from '../errors/custom-error';
import { setSystemUserContextSQL } from '../queries/database/user-context-queries';
import * as db from './db';
import { getAPIUserDBConnection, getDBConnection, getDBPool, IDBConnection, initDBPool } from './db';

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
        getDBConnection((null as unknown) as object);

        expect.fail();
      } catch (actualError) {
        expect((actualError as HTTPError).message).to.equal('Keycloak token is undefined');
      }
    });

    it('returns a database connection instance', () => {
      const connection = getDBConnection({});

      expect(connection).not.to.be.null;
    });

    describe('DBConnection', () => {
      const sinonSandbox = Sinon.createSandbox();

      const mockKeycloakToken = { preferred_username: 'test@idir' };

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

            const expectedSystemUserContextSQL = setSystemUserContextSQL('test', SYSTEM_IDENTITY_SOURCE.IDIR);
            expect(queryStub).to.have.been.calledWith(
              expectedSystemUserContextSQL?.text,
              expectedSystemUserContextSQL?.values
            );

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

            let expectedError: Error;
            try {
              await connection.open();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as Error;
            }

            expect(expectedError.message).to.equal('DBPool is not initialized');

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

            let expectedError: Error;
            try {
              await connection.commit();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as Error;
            }

            expect(expectedError.message).to.equal('DBConnection is not open');
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

            let expectedError: Error;
            try {
              await connection.rollback();

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as Error;
            }

            expect(expectedError.message).to.equal('DBConnection is not open');
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

            let expectedError: Error;
            try {
              await connection.query('sql query');

              expect.fail('Expected an error to be thrown');
            } catch (error) {
              expectedError = error as Error;
            }

            expect(expectedError.message).to.equal('DBConnection is not open');
          });
        });
      });
    });
  });

  describe('getAPIUserDBConnection', () => {
    it('calls getDBConnection for the biohub_api user', () => {
      const getDBConnectionStub = Sinon.stub(db, 'getDBConnection').returns(
        ('stubbed DBConnection object' as unknown) as IDBConnection
      );

      getAPIUserDBConnection();

      expect(getDBConnectionStub).to.have.been.calledWith({ preferred_username: 'biohub_api@database' });
    });
  });
});
