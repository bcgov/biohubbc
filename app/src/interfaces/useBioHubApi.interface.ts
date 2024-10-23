export type WarningSchema<DataType extends Record<string, unknown> = Record<string, unknown>> = {
  name: string;
  message: string;
  data: DataType;
  errors?: (string | Record<string, unknown>)[];
};
