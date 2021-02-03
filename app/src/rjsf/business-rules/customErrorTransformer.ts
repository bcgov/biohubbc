import { AjvError } from '@rjsf/core';

// TODO enhance to be generic like functions in customValidation.ts

/**
 * Returns a custom error transformer.
 *
 * @return {*}
 */
export const getCustomErrorTransformer = () => {
  return (errors: AjvError[]) => {
    const transformedErrors = errors.filter((error) => {
      if (error.message === 'should be equal to one of the allowed values') {
        return false;
      }

      if (error.message === 'should match exactly one schema in oneOf') {
        return false;
      }

      if (error.message === 'should match some schema in anyOf') {
        return false;
      }

      if (error.message === 'should match format "email"') {
        error.message = 'is not a valid email address';
        return true;
      }

      return true;
    });

    return transformedErrors;
  };
};
