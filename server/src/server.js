const app = require('./app');
const connectDB = require('./config/database');
const config = require('./config/env');

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(`ClinicOCR server running on port ${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Client URL: ${config.clientUrl}`);
  });
};

startServer().catch(console.error);