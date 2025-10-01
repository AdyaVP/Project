import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Importar rutas (cuando estén creadas)
// import authRoutes from './routes/auth.routes';
// import userRoutes from './routes/user.routes';
// import vehicleRoutes from './routes/vehicle.routes';
// import clientRoutes from './routes/client.routes';
// import reservationRoutes from './routes/reservation.routes';
// import invoiceRoutes from './routes/invoice.routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARES ====================
app.use(helmet()); // Seguridad HTTP headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== HEALTH CHECK ====================
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'CRM API is running',
    timestamp: new Date().toISOString(),
  });
});

// ==================== API ROUTES ====================
app.get('/api', (req: Request, res: Response) => {
  res.json({
    message: 'CRM Backend API v1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      vehicles: '/api/vehicles',
      clients: '/api/clients',
      reservations: '/api/reservations',
      invoices: '/api/invoices',
      contracts: '/api/contracts',
    }
  });
});

// Descomentar cuando las rutas estén creadas:
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/vehicles', vehicleRoutes);
// app.use('/api/clients', clientRoutes);
// app.use('/api/reservations', reservationRoutes);
// app.use('/api/invoices', invoiceRoutes);
// app.use('/api/contracts', contractRoutes);

// ==================== ERROR HANDLING ====================
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource does not exist',
  });
});

// ==================== START SERVER ====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

export default app;
