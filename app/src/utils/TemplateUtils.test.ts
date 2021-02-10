import { populateTemplateWithCodes } from './TemplateUtils';

describe('populateTemplateWithCodes', () => {
  // A hypothetical representation of 3 code sets, which each have multiple codes
  // Additionally, each has a unique set of properties, which ultimately represents the unique identifier and human
  // readable string for the code
  const codes = {
    code_set_one: [
      {
        id: 1,
        description: 'Code A'
      },
      {
        id: 2,
        description: 'Code B'
      },
      {
        id: 3,
        description: 'Code C'
      }
    ],
    code_set_two: [
      {
        id: 4,
        text: 'Code D'
      },
      {
        id: 5,
        text: 'Code E'
      }
    ],
    code_set_three: [
      {
        key: '6',
        description: 'Code F'
      },
      {
        key: '7',
        description: 'Code G'
      },
      {
        key: '8',
        description: 'Code H'
      }
    ]
  };

  it('returns the template unchanged if the codes param is null', function () {
    const updatedTemplate = populateTemplateWithCodes(null, {});

    expect(updatedTemplate).toStrictEqual({});
  });

  it('returns the template unchanged if the template param is null', function () {
    const updatedTemplate = populateTemplateWithCodes({}, null);

    expect(updatedTemplate).toStrictEqual(null);
  });

  describe('Template has no fields marked to indicate that enums should be populated', () => {
    const templateWithNoMarkedFields = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age'
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address'
        }
      }
    };

    it('returns the template unchanged', function () {
      const updatedTemplate = populateTemplateWithCodes(codes, templateWithNoMarkedFields);

      expect(updatedTemplate).toStrictEqual(templateWithNoMarkedFields);
    });
  });

  describe('Template has one field marked to indicate that enums should be populated', () => {
    const templateWithOneMarkedField = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age'
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          }
        }
      }
    };

    const templateWithOnePopulatedField = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age'
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          },
          anyOf: [
            {
              type: 'string',
              enum: ['6'],
              title: 'Code F'
            },
            {
              type: 'string',
              enum: ['7'],
              title: 'Code G'
            },
            {
              type: 'string',
              enum: ['8'],
              title: 'Code H'
            }
          ]
        }
      }
    };

    it('returns the template with enums added for the marked field', function () {
      const updatedTemplate = populateTemplateWithCodes(codes, templateWithOneMarkedField);

      expect(updatedTemplate).toStrictEqual(templateWithOnePopulatedField);
    });
  });

  describe('Template has one field marked to indicate that enums should be populated', () => {
    const templateWithTwoMarkedField = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age',
              'x-enum-code': {
                table: 'code_set_two',
                id_column: 'id',
                text_column: 'text'
              }
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          }
        }
      }
    };

    const templateWithTwoPopulatedFields = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age',
              'x-enum-code': {
                table: 'code_set_two',
                id_column: 'id',
                text_column: 'text'
              },
              anyOf: [
                {
                  type: 'number',
                  enum: [4],
                  title: 'Code D'
                },
                {
                  type: 'number',
                  enum: [5],
                  title: 'Code E'
                }
              ]
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          },
          anyOf: [
            {
              type: 'string',
              enum: ['6'],
              title: 'Code F'
            },
            {
              type: 'string',
              enum: ['7'],
              title: 'Code G'
            },
            {
              type: 'string',
              enum: ['8'],
              title: 'Code H'
            }
          ]
        }
      }
    };

    it('returns the template with enums added for the two marked fields', function () {
      const updatedTemplate = populateTemplateWithCodes(codes, templateWithTwoMarkedField);

      expect(updatedTemplate).toStrictEqual(templateWithTwoPopulatedFields);
    });
  });

  describe('Template has one field marked to indicate that enums should be populated but codes contains no matching codeset', () => {
    const templateWithTwoMarkedField = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age',
              'x-enum-code': {
                table: 'code_set_two',
                id_column: 'id',
                text_column: 'text'
              }
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          }
        }
      }
    };

    const templateWithTwoPopulatedFields = {
      type: 'object',
      required: ['address'],
      properties: {
        _a_nested_set_of_fields: {
          title: 'Person Details',
          type: 'object',
          required: ['first_name', 'last_name'],
          properties: {
            first_name: {
              type: 'string',
              title: 'First Name'
            },
            last_name: {
              type: 'string',
              title: 'Last Name'
            },
            age: {
              type: 'number',
              title: 'Age',
              'x-enum-code': {
                table: 'code_set_two',
                id_column: 'id',
                text_column: 'text'
              },
              anyOf: [
                {
                  type: 'number',
                  enum: [4],
                  title: 'Code D'
                },
                {
                  type: 'number',
                  enum: [5],
                  title: 'Code E'
                }
              ]
            },
            birthdate: {
              type: 'string',
              title: 'Birth Date'
            }
          }
        },
        address: {
          type: 'string',
          title: 'Address',
          'x-enum-code': {
            table: 'code_set_three',
            id_column: 'key',
            text_column: 'description'
          },
          anyOf: [
            {
              type: 'string',
              enum: ['6'],
              title: 'Code F'
            },
            {
              type: 'string',
              enum: ['7'],
              title: 'Code G'
            },
            {
              type: 'string',
              enum: ['8'],
              title: 'Code H'
            }
          ]
        }
      }
    };

    it('returns the template with enums added for the two marked fields', function () {
      const updatedTemplate = populateTemplateWithCodes(codes, templateWithTwoMarkedField);

      expect(updatedTemplate).toStrictEqual(templateWithTwoPopulatedFields);
    });
  });
});
