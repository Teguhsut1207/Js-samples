require('dotenv').config();

const {
  PGHOST, PGPORT, PGUSER, PGDATABASE, PGPASSWORD,
} = process.env;

module.exports = {
  development: {
    username: PGUSER,
    password: PGPASSWORD,
    database: PGDATABASE,
    host: PGHOST,
    port: PGPORT,
    dialect: 'postgres',
  },
};
