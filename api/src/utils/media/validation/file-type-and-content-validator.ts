import { safeToLowerCase } from '../../string-utils';
import { DWCArchive, DWCArchiveValidator } from '../dwc/dwc-archive-file';
import { MediaValidator } from '../media-file';
import { XLSXCSV, XLSXCSVValidator } from '../xlsx/xlsx-file';

/**
 * Return a validator function that checks if the file is empty.
 *
 * @return {*}  {MediaValidator}
 */
export const getFileEmptyValidator = (): MediaValidator => {
  return (mediaFile) => {
    if (!mediaFile.buffer || !mediaFile.buffer.byteLength) {
      mediaFile.mediaValidation.addFileErrors(['File is empty']);
    }

    return mediaFile;
  };
};

export type MimetypeValidatorConfig = {
  mimetype_validator: {
    name?: string;
    description?: string;
    reg_exps: string[];
  };
};

/**
 * Return a validator function that checks the mimetype of the file.
 *
 * @param {MimetypeValidatorConfig} [config]
 * @return {*}  {(DWCArchiveValidator | XLSXCSVValidator)}
 */
export const getFileMimeTypeValidator = (config?: MimetypeValidatorConfig): DWCArchiveValidator | XLSXCSVValidator => {
  return (file: any) => {
    if (!config) {
      return file;
    }

    if (!config.mimetype_validator.reg_exps.length) {
      return file;
    }

    if (
      !config.mimetype_validator.reg_exps.some((regexString) => {
        const regex = new RegExp(regexString, 'i');

        return regex.test(file.rawFile.mimetype);
      })
    ) {
      file.mediaValidation.addFileErrors([
        `File mime type is invalid, must be one of: ${config.mimetype_validator.reg_exps.join(', ')}`
      ]);
    }

    return file;
  };
};

export type SubmissionRequiredFilesValidatorConfig = {
  submission_required_files_validator: {
    name?: string;
    description?: string;
    required_files: string[];
  };
};

/**
 * Return a validator function that checks that the file contains all required files.
 *
 * @param {SubmissionRequiredFilesValidatorConfig} [config]
 * @return {*}  {(DWCArchiveValidator | XLSXCSVValidator)}
 */
export const getRequiredFilesValidator = (
  config?: SubmissionRequiredFilesValidatorConfig
): DWCArchiveValidator | XLSXCSVValidator => {
  return (file: any) => {
    if (!config) {
      // No required files specified
      return file;
    }

    if (!config.submission_required_files_validator.required_files.length) {
      // No required files specified
      return file;
    }

    if (file instanceof DWCArchive) {
      checkRequiredFieldsInDWCArchive(file, config);
    } else if (file instanceof XLSXCSV) {
      checkRequiredFieldsInXLSXCSV(file, config);
    }

    return file;
  };
};

/**
 * Check that the DWCArchive contains all required files.
 *
 * @param {DWCArchive} dwcArchive
 * @param {SubmissionRequiredFilesValidatorConfig} config
 * @return {*}
 */
const checkRequiredFieldsInDWCArchive = (dwcArchive: DWCArchive, config: SubmissionRequiredFilesValidatorConfig) => {
  // If there are no files in the archive, then add errors for all required files
  if (!dwcArchive.rawFile.mediaFiles || !dwcArchive.rawFile.mediaFiles.length) {
    dwcArchive.mediaValidation.addFileErrors(
      config.submission_required_files_validator.required_files.map((requiredFile) => {
        return `Missing required file: ${requiredFile}`;
      })
    );

    return dwcArchive;
  }

  const fileNames = dwcArchive.rawFile.mediaFiles.map((mediaFile) => mediaFile.name);

  config.submission_required_files_validator.required_files.forEach((requiredFile) => {
    if (!fileNames.includes(safeToLowerCase(requiredFile))) {
      dwcArchive.mediaValidation.addFileErrors([`Missing required file: ${requiredFile}`]);
    }
  });
};

/**
 * Check that the XLSX workbook contains all required sheets.
 *
 * @param {XLSXCSV} xlsxCsv
 * @param {SubmissionRequiredFilesValidatorConfig} config
 * @return {*}
 */
const checkRequiredFieldsInXLSXCSV = (xlsxCsv: XLSXCSV, config: SubmissionRequiredFilesValidatorConfig) => {
  // If there are no sheets in the excel file, then add errors for all required sheets

  if (!xlsxCsv.workbook || !xlsxCsv.workbook.worksheets || !Object.keys(xlsxCsv.workbook.worksheets).length) {
    xlsxCsv.mediaValidation.addFileErrors(
      config.submission_required_files_validator.required_files.map((requiredFile) => {
        return `Missing required sheet: ${requiredFile}`;
      })
    );

    return xlsxCsv;
  }

  const worksheetNames = Object.keys(xlsxCsv.workbook.worksheets).map(safeToLowerCase);

  config.submission_required_files_validator.required_files.forEach((requiredFile) => {
    if (!worksheetNames.includes(safeToLowerCase(requiredFile))) {
      xlsxCsv.mediaValidation.addFileErrors([`Missing required sheet: ${requiredFile}`]);
    }
  });
};
