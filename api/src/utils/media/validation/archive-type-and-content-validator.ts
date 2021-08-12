import { ArchiveValidator } from '../media-file';

export const getRequiredFilesArchiveValidator = (requiredFiles: string[]): ArchiveValidator => {
  return (archiveFile) => {
    if (!requiredFiles || !requiredFiles.length) {
      return archiveFile;
    }

    // If there are no files in the archive, then add errors for all required files
    if (!archiveFile.mediaFiles || !archiveFile.mediaFiles.length) {
      archiveFile.mediaValidation.addFileErrors(
        requiredFiles.map((requiredFile) => {
          return `Missing required file: ${requiredFile}`;
        })
      );

      return archiveFile;
    }

    const mediaFileNames = archiveFile.mediaFiles.map((mediaFile) => mediaFile.name);

    requiredFiles.forEach((requiredFile) => {
      if (!mediaFileNames.includes(requiredFile)) {
        archiveFile.mediaValidation.addFileErrors([`Missing required file: ${requiredFile}`]);
      }
    });

    return archiveFile;
  };
};
