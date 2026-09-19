const config = require('./config');
const app = require('./app');
const { db } = require('./auth');

db.ready
  .then(() => app.listen(config.port, () => console.log(`Hermes server listening on port ${config.port}`)))
  .catch((error) => {
    console.error('Unable to initialize the database:', error);
    process.exitCode = 1;
  });
