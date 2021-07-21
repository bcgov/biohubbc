import { expect } from 'chai';
import { describe } from 'mocha';
import { isObject, isObjectWithkeys, prettyPrint, getPrintfFunction, ILoggerMessage } from './logger';

describe('isObject', () => {
  it('identifies if object is valid when undefined', () => {
    expect(isObject(undefined)).to.be.false;
  });

  it('identifies if object is valid when null', () => {
    expect(isObject(null)).to.be.false;
  });

  it('identifies if object is valid when an empty string', () => {
    expect(isObject('')).to.be.false;
  });

  it('identifies if object is valid when a string', () => {
    expect(isObject('hello')).to.be.false;
  });

  it('identifies if object is valid when an array', () => {
    expect(isObject([])).to.be.true;
  });

  it('identifies if object is valid when 0', () => {
    expect(isObject(0)).to.be.false;
  });

  it('identifies if object is valid when an integer', () => {
    expect(isObject(1)).to.be.false;
  });

  it('identifies if object is valid when a curly bracket object', () => {
    expect(isObject({})).to.be.true;
  });

  it('identifies if object is valid when a new Object', () => {
    expect(isObject(new Object())).to.be.true;
  });
});

describe('isObjectWithkeys', () => {
  it('identifies if object is valid and has keys when undefined', () => {
    expect(isObjectWithkeys(undefined)).to.be.false;
  });

  it('identifies if object is valid and has keys when null', () => {
    expect(isObjectWithkeys(null)).to.be.false;
  });

  it('identifies if object is valid and has keys when an empty string', () => {
    expect(isObjectWithkeys('')).to.be.false;
  });

  it('identifies if object is valid and has keys when a string', () => {
    expect(isObjectWithkeys('hello')).to.be.false;
  });

  it('identifies if object is valid and has keys when an array', () => {
    expect(isObjectWithkeys([])).to.be.false;
  });

  it('identifies if object is valid and has keys when 0', () => {
    expect(isObjectWithkeys(0)).to.be.false;
  });

  it('identifies if object is valid and has keys when an integer', () => {
    expect(isObjectWithkeys(1)).to.be.false;
  });

  it('identifies if object is valid and has keys when a curly bracket object', () => {
    expect(isObjectWithkeys({ a: 1 })).to.be.true;
  });

  it('identifies if object is valid and has keys when a new Object', () => {
    expect(isObjectWithkeys(new Object({ a: 1 }))).to.be.true;
  });
});

describe('prettyPrint', () => {
  it('stringifies undefined values', () => {
    expect(prettyPrint(undefined)).to.be.undefined;
  });

  it('stringifies null values', () => {
    expect(prettyPrint(null)).to.equal('null');
  });

  it('stringifies empty string values', () => {
    expect(prettyPrint('')).to.equal('""');
  });

  it('stringifies string values', () => {
    expect(prettyPrint('hello')).to.equal('"hello"');
  });

  it('stringifies array values', () => {
    expect(prettyPrint([])).to.equal('[]');
  });

  it('stringifies 0 values', () => {
    expect(prettyPrint(0)).to.equal('0');
  });

  it('stringifies integer values', () => {
    expect(prettyPrint(1)).to.equal('1');
  });

  it('stringifies curly bracket objects', () => {
    expect(prettyPrint({ a: 1 })).to.equal('{\n  "a": 1\n}');
  });

  it('stringifies new Objects', () => {
    expect(prettyPrint(new Object({ a: 1 }))).to.equal('{\n  "a": 1\n}');
  });
});

describe('getPrintfFunction', () => {
  let printFunction: (args: ILoggerMessage) => string;

  beforeEach(() => {
    printFunction = getPrintfFunction('logLabel');
  });

  it('returns template string without additional objects', () => {
    const result = printFunction({
      timestamp: '2021-10-20',
      level: 'info',
      label: 'label',
      message: 'message',
      error: new Error('an error')
    });

    expect(result).to.equal('[2021-10-20] (info) (logLabel): label - message \nError: an error ');
  });

  it('returns template string with additional objects', () => {
    const result = printFunction({
      timestamp: '2021-10-20',
      level: 'info',
      label: 'label',
      message: 'message',
      error: new Error('an error'),
      additionalObj: { a: 1 }
    });

    expect(result).to.equal(
      '[2021-10-20] (info) (logLabel): label - message \nError: an error \n{\n  "additionalObj": {\n    "a": 1\n  }\n}'
    );
  });
});
