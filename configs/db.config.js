import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let sequelize;

// Cek apakah aplikasi berjalan di lingkungan production (seperti Railway)
// Jika ya, gunakan DATABASE_URL yang disediakan Railway
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    // Opsi ini penting untuk koneksi ke database di layanan cloud seperti Railway
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Diperlukan untuk koneksi ke database Railway
      }
    },
    logging: false,
  });
} else {
  // Jika tidak, gunakan konfigurasi lokal dari file .env
  // Ini untuk development di komputermu
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }

  sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'postgres',
    logging: false,
  });
}

export { sequelize };