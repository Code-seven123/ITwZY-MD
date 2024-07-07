import { createConnection } from "mysql2/promise"
import { BufferJSON, initAuthCreds, fromObject } from "./utils.js"

async function connection(config, force = false) {
  let conn = await createConnection({
    database: config.database || "base",
    host: config.host || "localhost",
    port: config.port || 3306,
    user: config.user || "root",
    password: config.password,
    password1: config.password1,
    password2: config.password2,
    password3: config.password3,
    enableKeepAlive: true,
    keepAliveInitialDelay: 5000,
    ssl: config.ssl,
    localAddress: config.localAddress,
    socketPath: config.socketPath,
    insecureAuth: config.insecureAuth || false,
    isServer: config.isServer || false
  })

  await conn.execute(
    "CREATE TABLE IF NOT EXISTS `" +
      config.tableName +
      "` (`session` varchar(50) NOT NULL, `id` varchar(80) NOT NULL, `value` json DEFAULT NULL, UNIQUE KEY `idxunique` (`session`,`id`), KEY `idxsession` (`session`), KEY `idxid` (`id`)) ENGINE=MyISAM;"
  )

  return conn
}

export const useMySQLAuthState = async config => {
  const sqlConn = await connection(config)

  const tableName = config.tableName || "auth"
  const retryRequestDelayMs = config.retryRequestDelayMs || 200
  const maxtRetries = config.maxtRetries || 10

  const query = async (sql, values) => {
    for (let x = 0; x < maxtRetries; x++) {
      try {
        const [rows] = await sqlConn.query(sql, values)
        return rows
      } catch (e) {
        await new Promise(r => setTimeout(r, retryRequestDelayMs))
      }
    }
    return []
  }

  const readData = async id => {
    const data = await query(
      `SELECT value FROM ${tableName} WHERE id = ? AND session = ?`,
      [id, config.session]
    )
    if (!data[0]?.value) {
      return null
    }
    const creds =
      typeof data[0].value === "object"
        ? JSON.stringify(data[0].value)
        : data[0].value
    const credsParsed = JSON.parse(creds, BufferJSON.reviver)
    return credsParsed
  }

  const writeData = async (id, value) => {
    const valueFixed = JSON.stringify(value, BufferJSON.replacer)
    await query(
      `INSERT INTO ${tableName} (session, id, value) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE value = ?`,
      [config.session, id, valueFixed, valueFixed]
    )
  }

  const removeData = async id => {
    await query(`DELETE FROM ${tableName} WHERE id = ? AND session = ?`, [
      id,
      config.session
    ])
  }

  const clearAll = async () => {
    await query(
      `DELETE FROM ${tableName} WHERE id != 'creds' AND session = ?`,
      [config.session]
    )
  }

  const removeAll = async () => {
    await query(`DELETE FROM ${tableName} WHERE session = ?`, [config.session])
  }

  const creds = (await readData("creds")) || initAuthCreds()

  return {
    state: {
      creds: creds,
      keys: {
        get: async (type, ids) => {
          const data = {}
          for (const id of ids) {
            let value = await readData(`${type}-${id}`)
            if (type === "app-state-sync-key" && value) {
              value = fromObject(value)
            }
            data[id] = value
          }
          return data
        },
        set: async data => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const name = `${category}-${id}`
              if (value) {
                await writeData(name, value)
              } else {
                await removeData(name)
              }
            }
          }
        }
      }
    },
    saveCreds: async () => {
      await writeData("creds", creds)
    },
    clear: async () => {
      await clearAll()
    },
    removeCreds: async () => {
      await removeAll()
    }
  }
}
