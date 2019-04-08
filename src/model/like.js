const PostgresUtil = require('../utils/PostgresUtil')

async function createLikeTable() {
  return await PostgresUtil.pool.query(`CREATE TABLE likes (
    messageId	INTEGER,
    created_by  VARCHAR(100)
  )`)
}

async function createLike(handle, data) {
  try {
    const result = await PostgresUtil.pool.query(
      'INSERT INTO likes(created_by, messageId) VALUES ($1, $2);',
      [
        handle, data
      ])

    return result
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createLikeTable()
      return createLike(handle, data)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

module.exports = {
  createLike: createLike,
  createLikeTable: createLikeTable,
}
