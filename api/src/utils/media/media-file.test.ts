import { expect } from 'chai';
import { describe } from 'mocha';
import sinon from 'sinon';
import { MediaFile, MediaValidation } from './media-file';

describe('MediaFile', () => {
  it('constructs', () => {
    const mediaFile = new MediaFile('fileName', 'mimetype', Buffer.from(''));

    expect(mediaFile).not.to.be.null;
  });

  describe('validate', () => {
    it('calls all provided validator functions', () => {
      const mediaFile = new MediaFile('fileName', 'mimetype', Buffer.from(''));

      expect(mediaFile).not.to.be.null;

      const mockValidationFunction1 = sinon.stub();
      const mockValidationFunction2 = sinon.stub();
      const mockValidationFunction3 = sinon.stub();

      mediaFile.validate([mockValidationFunction1, mockValidationFunction2, mockValidationFunction3]);

      expect(mockValidationFunction1).to.have.been.calledOnce;
      expect(mockValidationFunction2).to.have.been.calledOnce;
      expect(mockValidationFunction3).to.have.been.calledOnce;
    });
  });
});

describe('MediaValidation', () => {
  it('constructs', () => {
    const mediaValidation = new MediaValidation('fileName');

    expect(mediaValidation).not.to.be.null;
  });

  describe('addFileErrors', () => {
    it('adds new file errors', () => {
      const mediaValidation = new MediaValidation('fileName');

      expect(mediaValidation).not.to.be.null;

      const fileError1 = 'a file error';
      const fileError2 = 'a second file error';

      mediaValidation.addFileErrors([fileError1]);

      expect(mediaValidation.fileErrors).to.eql([fileError1]);

      mediaValidation.addFileErrors([fileError2]);

      expect(mediaValidation.fileErrors).to.eql([fileError1, fileError2]);
    });
  });

  describe('getState', () => {
    it('gets the current validation state', () => {
      const mediaValidation = new MediaValidation('fileName');

      expect(mediaValidation).not.to.be.null;

      const fileError1 = 'a file error';

      mediaValidation.addFileErrors([fileError1]);

      const validationState = mediaValidation.getState();

      expect(validationState).to.eql({
        fileName: 'fileName',
        fileErrors: [fileError1],
        isValid: false
      });
    });
  });
});
