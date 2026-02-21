const { Client } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_8YouqRveUVw6@ep-gentle-sunset-a4nv4nfm-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

async function testConnection() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('Attempting to connect to the database...');
    await client.connect();
    console.log('Successfully connected to the database!');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from DB:', res.rows[0]);
    await client.end();
  } catch (err) {
    console.error('Connection error:', err.stack);
  }
}

testConnection();
