export enum ProjectAttachmentType {
  AUDIO = 'Audio',
  DATA = 'Data File',
  IMAGE = 'Image',
  REPORT = 'Report',
  SPATIAL = 'Spatial File',
  VIDEO = 'Video'
}

export enum ProjectAttachmentValidExtensions {
  AUDIO = '.wav, .mp3, .mp4, .wma',
  DATA = '.txt, .xls, .xlsx, .xlsm, .xlsb, .accdb, .mdb, .ods, .csv',
  IMAGE = '.gif, .png, .jpg, .jpeg, .svg, .tiff, .bmp, .tif',
  REPORT = '.doc, .docx, .png',
  SPATIAL = '.kml, .gdb, .lyr, .shp, .las, .laz, .zlas, .gml, .gpx, .json',
  VIDEO = '.mp4, .mov, .wmv, .ave',
  OTHER = '.doc, .docx, .pdf, .xls, .xlsx, .xlsm, .xlsb, .accdb, .mdb, .ods, .shp, .gdb, .kml, .json'
}
