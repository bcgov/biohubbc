import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { CritterbaseService, ICreateCritter } from './critterbase-service';

chai.use(sinonChai);

describe('CritterbaseService', () => {
  afterEach(() => {
    sinon.restore();
  });

  const mockUser = { keycloak_guid: 'abc123', username: 'testuser' };

  describe('Critterbase service public methods', () => {
    afterEach(() => {
      sinon.restore();
    });

    const cb = new CritterbaseService(mockUser);

    describe('getTaxonMeasurements', () => {
      it('should retrieve taxon measurements', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getTaxonMeasurements('123456');
        expect(axiosStub).to.have.been.calledOnceWith('/xref/taxon-measurements', { params: { tsn: '123456' } });
      });
    });

    describe('getTaxonBodyLocations', () => {
      it('should retrieve taxon body locations', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getTaxonBodyLocations('asdf');
        expect(axiosStub).to.have.been.calledOnceWith('/xref/taxon-marking-body-locations', {
          params: {
            tsn: 'asdf',
            format: 'asSelect'
          }
        });
      });
    });

    describe('getQualitativeOptions', () => {
      it('should retrieve qualitative options', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getQualitativeOptions('asdf');
        expect(axiosStub).to.have.been.calledOnceWith('/xref/taxon-qualitative-measurement-options', {
          params: { taxon_measurement_id: 'asdf', format: 'asSelect' }
        });
      });
    });

    describe('getFamilies', () => {
      it('should retrieve families', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getFamilies();
        expect(axiosStub).to.have.been.calledOnceWith('/family');
      });
    });

    describe('getFamilyById', () => {
      it('should retrieve a family', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getFamilyById('asdf');
        expect(axiosStub).to.have.been.calledOnceWith('/family/' + 'asdf');
      });
    });

    describe('getCritter', () => {
      it('should fetch a critter', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'get').resolves({ data: [] });
        await cb.getCritter('asdf');
        expect(axiosStub).to.have.been.calledOnceWith('/critters/' + 'asdf', { params: { format: 'detailed' } });
      });
    });

    describe('createCritter', () => {
      it('should create a critter', async () => {
        const data: ICreateCritter = {
          wlh_id: 'aaaa',
          animal_id: 'aaaa',
          sex_qualitative_option_id: 'male',
          itis_tsn: 1,
          critter_comment: 'None.'
        };
        const axiosStub = sinon.stub(cb.axiosInstance, 'post').resolves({ data: [] });

        await cb.createCritter(data);
        expect(axiosStub).to.have.been.calledOnceWith('/critters/create', data);
      });
    });

    describe('signUp', () => {
      it('should sign up a user', async () => {
        const axiosStub = sinon.stub(cb.axiosInstance, 'post').resolves({ data: [] });
        await cb.signUp();
        expect(axiosStub).to.have.been.calledOnceWith('/signup');
      });
    });
  });
});
