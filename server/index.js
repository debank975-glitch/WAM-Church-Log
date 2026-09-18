const config = require('./config');
const app = require('./app');
app.listen(config.port, () => console.log(`Hermes server listening on port ${config.port}`));
