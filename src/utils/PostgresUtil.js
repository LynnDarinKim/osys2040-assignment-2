const { Pool } = require('pg')

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: true,
//	 user: 'darinkim',
	 //host: 'localhost',
	 //database: 'darinkim',
	 //password: '901128',
	 //port: '5432',
})

module.exports = {
  pool,
}
