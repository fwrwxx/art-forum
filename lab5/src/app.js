const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { errorMiddleware, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Swagger configuration - ОНОВЛЕНО
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Book Club API',
      version: '1.0.0',
      description: 'Secure REST API for Book Club',
      contact: {
        name: 'Student: Shtyfliuk Olga',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Шлях до файлів з JSDoc
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());

// Головний маршрут
app.get('/', (req, res) => {
  res.json({
    name: 'Book Club API',
    version: '1.0.0',
    description: 'Лабораторна робота №5: Безпека та продуктивність серверних додатків',
    endpoints: {
      health: 'GET /health',
      documentation: 'GET /api-docs',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      books: {
        getAll: 'GET /api/books',
        getById: 'GET /api/books/:id',
        create: 'POST /api/books (Admin only)',
        update: 'PUT /api/books/:id (Admin only)',
        delete: 'DELETE /api/books/:id (Admin only)'
      }
    },
    student: 'Штифлюк Ольга Володимирівна',
    group: 'ІВ-93',
    date: new Date().toISOString().split('T')[0]
  });
});

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Book Club API Documentation',
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Error handling
app.use(notFound);
app.use(errorMiddleware);

module.exports = app;