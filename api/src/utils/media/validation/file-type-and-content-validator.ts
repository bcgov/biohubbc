import { DWCArchive, DWCArchiveValidator } from '../dwc/dwc-archive-file';
import { MediaValidator } from '../media-file';
import { XLSXCSV, XLSXCSVValidator } from '../xlsx/xlsx-file';

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
        const regex = new RegExp(regexString);

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
    if (!fileNames.includes(requiredFile.toLowerCase())) {
      dwcArchive.mediaValidation.addFileErrors([`Missing required file: ${requiredFile}`]);
    }
  });
};

const checkRequiredFieldsInXLSXCSV = (dwcArchive: XLSXCSV, config: SubmissionRequiredFilesValidatorConfig) => {
  // If there are no sheets in the excel file, then add errors for all required sheets

  if (!dwcArchive.workbook || !dwcArchive.workbook.worksheets || !Object.keys(dwcArchive.workbook.worksheets).length) {
    dwcArchive.mediaValidation.addFileErrors(
      config.submission_required_files_validator.required_files.map((requiredFile) => {
        return `Missing required sheet: ${requiredFile}`;
      })
    );

    return dwcArchive;
  }

  const worksheetNames = Object.keys(dwcArchive.workbook.worksheets).map((item) => item.toLowerCase());

  config.submission_required_files_validator.required_files.forEach((requiredFile) => {
    if (!worksheetNames.includes(requiredFile.toLowerCase())) {
      dwcArchive.mediaValidation.addFileErrors([`Missing required sheet: ${requiredFile}`]);
    }
  });
};
