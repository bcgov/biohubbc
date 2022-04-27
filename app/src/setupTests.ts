// @ts-nocheck
/*
jest-dom adds custom jest matchers for asserting on DOM nodes
It allows you to do things like:

expect(element).toHaveTextContent(/react/i)
learn more: https://github.com/testing-library/jest-dom
*/
import '@testing-library/jest-dom/extend-expect';
import { configure } from '@testing-library/react';

/*
  Extend JSDOM SVGSVGElement by introducing createSVGRect as an empty function

  This technique allows us to emulate SVG support in JSDOM in order to pass Jest tests
  for vector overlays such as Polygon
*/
const createElementNSOrig = global.document.createElementNS;

global.document.createElementNS = function (namespaceURI, qualifiedName) {
  if (namespaceURI === 'http://www.w3.org/2000/svg' && qualifiedName === 'svg') {
    // eslint-disable-next-line prefer-rest-params
    const element = createElementNSOrig.apply(this, arguments);

    element.createSVGRect = function () {
      // This is intentional
    };

    return element;
  }

  // eslint-disable-next-line prefer-rest-params
  return createElementNSOrig.apply(this, arguments);
};

/*
  Configure testing-library to modify the console output when a test fails.

  Current config below removes the giant HTML prints from the console when a test fails.

  See: https://testing-library.com/docs/dom-testing-library/api-configuration/
*/
configure({
  getElementError: (message: string | null) => {
    const error = new Error(message || undefined);
    error.name = 'TestingLibraryElementError';
    error.stack = undefined;
    return error;
  }
});
