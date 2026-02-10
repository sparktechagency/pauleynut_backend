// import cors from 'cors';
// import express, { Application, Request, Response } from 'express';
// import session from 'express-session';
// import router from './routes';
// import { Morgan } from './shared/morgen';
// import globalErrorHandler from './globalErrorHandler/globalErrorHandler';
// import { notFound } from './app/middleware/notFound';
// import { welcome } from './utils/welcome';
// import config from './config';
// import path from 'path';
// import passport from './config/passport';
// // import setupTimeManagement from './utils/crons/cronJobs';

// const app: Application = express();

// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));
// //morgan
// app.use(Morgan.successHandler);
// app.use(Morgan.errorHandler);

// // body parser
// app.use(
//      cors({
//           origin: '*',
          
//           credentials: true,
//      }),
// );

// const allowedOrigins = [
//                'http://10.10.7.79:3001',
//                'http://localhost:3002',
//                'http://204.197.173.144:3002',
//                'http://localhost:3000',
//                'https://dashboard.gopassit.org',
//                'https://www.gopassit.org',
//                'https://gopassit.org',
//                'https://api.gopassit.org'
//           ]

// // app.use(
// //   cors({
// //     origin: function (origin, callback) {
// //       // Allow requests with no origin (like mobile apps or curl requests)
// //       if (!origin) return callback(null, true);
      
// //       if (allowedOrigins.indexOf(origin) === -1) {
// //         const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
// //         return callback(new Error(msg), false);
// //       }
// //       return callback(null, true);
// //     },
// //     credentials: true,
// //     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
// //     allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
// //   })
// // );

// app.use(express.json({ limit: '100mb' }));
// app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// // Session configuration for OAuth
// app.use(
//      session({
//           secret: config.express_session as string,
//           resave: false,
//           saveUninitialized: false,
//           cookie: {
//                secure: config.node_env === 'production',
//                httpOnly: true,
//                maxAge: 24 * 60 * 60 * 1000, // 24 hours
//           },
//      }),
// );

// // Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

// //file retrieve
// app.use(express.static('uploads'));
// app.use(express.static('public'));

// //router
// app.use('/api/v1', router);
// //live response
// app.get('/', (req: Request, res: Response) => {
//      res.send(welcome());
// });

// //global error handle
// app.use(globalErrorHandler);

// //handle not found route;
// app.use(notFound);
// // setupTimeManagement();
// export default app;


import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import session from 'express-session';
import router from './routes';
import { Morgan } from './shared/morgen';
import globalErrorHandler from './globalErrorHandler/globalErrorHandler';
import { notFound } from './app/middleware/notFound';
import { welcome } from './utils/welcome';
import config from './config';
import path from 'path';
import passport from './config/passport';

const app: Application = express();

app.options('*', (req, res) => {
  const origin = req.headers.origin;
  
  // Only allow your frontend
  if (origin === 'https://dashboard.gopassit.org') {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.status(200).send();
  } else {
    res.status(403).send('Not allowed');
  }
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

// ========== SIMPLE CORS FIX ==========
app.use(
  cors({
    origin: [
               'http://10.10.7.79:3001',
               'http://localhost:3002',
               'http://204.197.173.144:3002',
               'http://localhost:3000',
               'https://dashboard.gopassit.org',
               'https://www.gopassit.org',
               'https://gopassit.org',
               'https://api.gopassit.org'
          ], // Just your frontend
    credentials: true,
  }),
);

// Body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Session configuration
app.use(
  session({
    secret: config.express_session as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: config.node_env === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use(express.static('uploads'));
app.use(express.static('public'));

// Router
app.use('/api/v1', router);

// Live response
app.get('/', (req: Request, res: Response) => {
  res.send(welcome());
});

// Global error handler
app.use(globalErrorHandler);

// Handle not found route
app.use(notFound);

export default app;