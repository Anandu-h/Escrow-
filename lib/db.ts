import mysql from "mysql2/promise"

declare global {
  // eslint-disable-next-line no-var
  var __mysqlPool: mysql.Pool | undefined
}

function createPool() {
  const url = process.env.DATABASE_URL
  if (url) {
    return mysql.createPool(url)
  }

  const host = process.env.MYSQL_HOST || "localhost"
  const port = Number(process.env.MYSQL_PORT || 3306)
  const user = process.env.MYSQL_USER || "root"
  const password = process.env.MYSQL_PASSWORD || "Akvs2910*"
  const database = process.env.MYSQL_DATABASE || "escrow_app"

  if (!password) {
    throw new Error('MYSQL_PASSWORD environment variable is required. Please set it in .env.local file')
  }

  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    connectionLimit: 10,
    waitForConnections: true,
  })
}

export const db = globalThis.__mysqlPool ?? (globalThis.__mysqlPool = createPool())

export async function query<T = any>(sql: string, params: any[] = []) {
  const [rows] = await db.query<mysql.RowDataPacket[]>(sql, params)
  return rows as unknown as T
}
