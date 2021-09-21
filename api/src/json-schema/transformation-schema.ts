export const submissionTransformationSchema = {
  description: 'Occurrence Submission Transformation Schema',
  type: 'object',
  required: ['transformations'],
  properties: {
    name: {
      description: 'The name of the submission file',
      type: 'string'
    },
    description: {
      description: 'The description of the submission file',
      type: 'string'
    },
    files: {
      description: 'An array of files/sheets within the submission file',
      type: 'array',
      items: [
        {
          $ref: '#/$defs/file'
        }
      ]
    }
  },
  $defs: {
    file: {
      description: 'The target file',
      type: 'object',
      required: ['name'],
      properties: {
        name: {
          description: 'The name of the file/sheet',
          type: 'string'
        },
        description: {
          description: 'The description of the file/sheet',
          type: 'string'
        },
        transformations: {
          description:
            'An array of transformations to apply against the source file in order to populate the target file',
          type: 'array',
          items: {
            $ref: '#/$defs/file_transformations'
          }
        }
      },
      additionalProperties: false
    },
    file_transformations: {
      title: 'File transformations',
      description: 'The transformations that can be applied against a file/sheet.',
      anyOf: [
        {
          $ref: '#/$defs/basic_transformer'
        },
        {
          $ref: '#/$defs/join_transformer'
        },
        {
          $ref: '#/$defs/split_transformer'
        }
      ]
    },
    basic_transformer: {
      description: '',
      type: 'object',
      properties: {
        basic_transformer: {
          type: 'object',
          required: ['source', 'target'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            source: {
              type: 'object',
              required: ['file', 'column'],
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            target: {
              type: 'object',
              required: ['file', 'column'],
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            extra: {
              $ref: '#/$defs/additional_targets'
            },
            pivot: {
              type: 'boolean'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    join_transformer: {
      description: '',
      type: 'object',
      properties: {
        join_transformer: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            sources: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string'
                  },
                  column: {
                    type: 'string'
                  }
                }
              }
            },
            separator: {
              type: 'string'
            },
            target: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            pivot: {
              type: 'boolean'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    split_transformer: {
      description: '',
      type: 'object',
      properties: {
        join_transformer: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            source: {
              type: 'object',
              properties: {
                file: {
                  type: 'string'
                },
                column: {
                  type: 'string'
                }
              }
            },
            separator: {
              type: 'string'
            },
            targets: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: {
                    type: 'string'
                  },
                  column: {
                    type: 'string'
                  }
                }
              }
            },
            pivot: {
              type: 'boolean'
            }
          },
          additionalProperties: false
        }
      },
      additionalProperties: false
    },
    additional_targets: {
      description: 'Additional columns that should be created alongside the targe transformed column(s)',
      type: 'object',
      properties: {
        additional_targets: {
          type: 'object',
          required: ['targets'],
          properties: {
            name: {
              type: 'string'
            },
            description: {
              type: 'string'
            },
            targets: {
              type: 'array',
              items: {
                type: 'object',
                required: ['file', 'column', 'value'],
                properties: {
                  file: {
                    type: 'string'
                  },
                  column: {
                    type: 'string'
                  },
                  value: {
                    type: ['string', 'number']
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  additionalProperties: false
};

// export const submissionTransformationSchema = {
//   description: 'Occurrence Submission Transformation Schema',
//   type: 'object',
//   required: ['transformations'],
//   properties: {
//     name: {
//       description: 'The name of the submission file',
//       type: 'string'
//     },
//     description: {
//       description: 'The description of the submission file',
//       type: 'string'
//     },
//     files: {
//       description: 'An array of files/sheets within the submission file',
//       type: 'array',
//       items: [
//         {
//           $ref: '#/$defs/file'
//         }
//       ]
//     }
//   },
//   $defs: {
//     file: {
//       description: 'A single file/sheet within a submission file',
//       type: 'object',
//       required: ['name'],
//       properties: {
//         name: {
//           description: 'The name of the file/sheet',
//           type: 'string'
//         },
//         description: {
//           description: 'The description of the file/sheet',
//           type: 'string'
//         },
//         transformations: {
//           description: 'An array of transformations to apply against the file/sheet',
//           type: 'array',
//           items: {
//             $ref: '#/$defs/file_transformations'
//           }
//         }
//       },
//       additionalProperties: false
//     },
//     file_transformations: {
//       title: 'Submission file transformations',
//       description: 'The transformations that can be applied against a file/sheet.',
//       anyOf: [
//         {
//           $ref: '#/$defs/basic_transformer'
//         },
//         {
//           $ref: '#/$defs/join_transformer'
//         },
//         {
//           $ref: '#/$defs/split_transformer'
//         }
//       ]
//     },
//     basic_transformer: {
//       description: '',
//       type: 'object',
//       properties: {
//         basic_transformer: {
//           type: 'object',
//           required: ['source', 'target'],
//           properties: {
//             name: {
//               type: 'string'
//             },
//             description: {
//               type: 'string'
//             },
//             source: {
//               type: 'object',
//               required: ['file', 'column'],
//               properties: {
//                 file: {
//                   type: 'string'
//                 },
//                 column: {
//                   type: 'string'
//                 }
//               }
//             },
//             target: {
//               type: 'object',
//               required: ['file', 'column'],
//               properties: {
//                 file: {
//                   type: 'string'
//                 },
//                 column: {
//                   type: 'string'
//                 }
//               }
//             },
//             extra: {
//               $ref: '#/$defs/additional_targets'
//             },
//             pivot: {
//               type: 'boolean'
//             }
//           },
//           additionalProperties: false
//         }
//       },
//       additionalProperties: false
//     },
//     join_transformer: {
//       description: '',
//       type: 'object',
//       properties: {
//         join_transformer: {
//           type: 'object',
//           properties: {
//             name: {
//               type: 'string'
//             },
//             description: {
//               type: 'string'
//             },
//             sources: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   file: {
//                     type: 'string'
//                   },
//                   column: {
//                     type: 'string'
//                   }
//                 }
//               }
//             },
//             separator: {
//               type: 'string'
//             },
//             target: {
//               type: 'object',
//               properties: {
//                 file: {
//                   type: 'string'
//                 },
//                 column: {
//                   type: 'string'
//                 }
//               }
//             },
//             pivot: {
//               type: 'boolean'
//             }
//           },
//           additionalProperties: false
//         }
//       },
//       additionalProperties: false
//     },
//     split_transformer: {
//       description: '',
//       type: 'object',
//       properties: {
//         join_transformer: {
//           type: 'object',
//           properties: {
//             name: {
//               type: 'string'
//             },
//             description: {
//               type: 'string'
//             },
//             source: {
//               type: 'object',
//               properties: {
//                 file: {
//                   type: 'string'
//                 },
//                 column: {
//                   type: 'string'
//                 }
//               }
//             },
//             separator: {
//               type: 'string'
//             },
//             targets: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 properties: {
//                   file: {
//                     type: 'string'
//                   },
//                   column: {
//                     type: 'string'
//                   }
//                 }
//               }
//             },
//             pivot: {
//               type: 'boolean'
//             }
//           },
//           additionalProperties: false
//         }
//       },
//       additionalProperties: false
//     },
//     additional_targets: {
//       description: 'Additional columns that should be created alongside the targe transformed column(s)',
//       type: 'object',
//       properties: {
//         additional_targets: {
//           type: 'object',
//           required: ['targets'],
//           properties: {
//             name: {
//               type: 'string'
//             },
//             description: {
//               type: 'string'
//             },
//             targets: {
//               type: 'array',
//               items: {
//                 type: 'object',
//                 required: ['file', 'column', 'value'],
//                 properties: {
//                   file: {
//                     type: 'string'
//                   },
//                   column: {
//                     type: 'string'
//                   },
//                   value: {
//                     type: ['string', 'number']
//                   }
//                 }
//               }
//             }
//           }
//         }
//       }
//     }
//   },
//   additionalProperties: false
// };
