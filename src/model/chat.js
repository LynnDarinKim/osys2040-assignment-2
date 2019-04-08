const PostgresUtil = require('../utils/PostgresUtil')
const Likes = require('./like.js')

async function createMessageTable() {
  await Likes.createLikeTable()

  return await PostgresUtil.pool.query(`CREATE TABLE messages (
    id          SERIAL PRIMARY KEY,
    created_at  TIMESTAMP DEFAULT NOW(),
    created_by  VARCHAR(200) REFERENCES app_users(handle),
    data        JSONB
  )`)
}

async function createMessage(handle, data) {
  try {
    const result = await PostgresUtil.pool.query(
      'INSERT INTO messages (created_by, data) VALUES ($1::text, $2::jsonb);',
      [
        handle, data
      ])

    return result
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createMessageTable()
      return createMessage(handle, data)
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

async function getMessages() {
  try {
    const result = await PostgresUtil.pool.query(
      `
        SELECT * FROM messages
	left join (
	  select messageId, count(*) as like_count
	  from likes
	  group by messageId
	) like_query
	on messages.id = like_query.messageId
      `)

    return result.rows
  } catch (exception) {
    if (exception.code === '42P01') {
      // 42P01 - table is missing - we'll create it and try again
      await createMessageTable()
      return getMessages()
    } else {
      // unrecognized, throw error to caller
      console.error(exception)
      throw exception
    }
  }
}

module.exports = {
  createMessage: createMessage,
  getMessages: getMessages,
}
