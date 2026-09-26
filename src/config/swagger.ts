const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Olato Quote API',
    version: '1.0.0',
    description: 'A public API serving random quotes across categories (motivation, love, success, inspiration).',
    contact: {
      name: 'Tobi Awosola',
    },
  },
  servers: [
    {
      url: '/v1',
      description: 'API v1',
    },
  ],
  paths: {
    '/': {
      get: {
        tags: ['General'],
        summary: 'API info',
        responses: {
          '200': {
            description: 'API information',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ApiResponseInfo',
                },
              },
            },
          },
        },
      },
    },
    '/quotes': {
      get: {
        tags: ['Quotes'],
        summary: 'Get a random quote',
        description: 'Returns a random quote from any category.',
        responses: {
          '200': {
            description: 'Random quote retrieved',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/QuoteResponse',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/quotes/{category}': {
      get: {
        tags: ['Quotes'],
        summary: 'Get a random quote by category',
        description: 'Returns a random quote from the specified category.',
        parameters: [
          {
            name: 'category',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['motivation', 'love', 'success', 'inspiration'],
            },
            description: 'The category slug',
          },
        ],
        responses: {
          '200': {
            description: 'Random quote retrieved',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/QuoteResponse',
                },
              },
            },
          },
          '404': {
            description: 'Category not found',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoryErrorResponse',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List available categories',
        description: 'Returns all available quote categories.',
        responses: {
          '200': {
            description: 'Categories retrieved',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CategoriesResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      Quote: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            example: 'The only way to do great work is to love what you do.',
          },
          author: {
            type: 'string',
            example: 'Steve Jobs',
          },
          category: {
            type: 'string',
            example: 'motivation',
          },
          source: {
            type: 'string',
            description: 'Where the quote was acquired from. Absent on the original seeded quotes.',
            example: 'Wikiquote',
          },
          sourceUrl: {
            type: 'string',
            description: 'Link to the page the quote was acquired from.',
            example: 'https://en.wikiquote.org/wiki/Motivation',
          },
          license: {
            type: 'string',
            description: 'Licence the source publishes the quote under.',
            example: 'CC BY-SA 3.0',
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          slug: {
            type: 'string',
            example: 'motivation',
          },
          name: {
            type: 'string',
            example: 'Motivation',
          },
        },
      },
      ApiResponseInfo: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              name: { type: 'string', example: 'Olato Quote API' },
              version: { type: 'string', example: '1.0.0' },
            },
          },
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'Welcome to Olato Quotes API' },
        },
      },
      QuoteResponse: {
        type: 'object',
        properties: {
          data: {
            $ref: '#/components/schemas/Quote',
          },
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'Random quote retrieved' },
        },
      },
      CategoriesResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Category',
            },
          },
          status: { type: 'string', example: 'ok' },
          message: { type: 'string', example: 'Categories retrieved' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          data: { type: 'object', nullable: true, example: null },
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Server error' },
        },
      },
      CategoryErrorResponse: {
        type: 'object',
        properties: {
          data: { type: 'object', nullable: true, example: null },
          status: { type: 'string', example: 'error' },
          message: { type: 'string', example: 'Category not found' },
          availableCategories: {
            type: 'array',
            items: { type: 'string' },
            example: ['motivation', 'love', 'success', 'inspiration'],
          },
        },
      },
    },
  },
};

export const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Olato Quote API Docs',
};

export default swaggerDocument;
