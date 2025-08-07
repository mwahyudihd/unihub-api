import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.config.js";

const UserInterest = sequelize.define('UserInterest', {
    // 1. Menambahkan Primary Key baru yang unik untuk setiap baris.
    user_interest_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Otomatis menghasilkan UUID.
        primaryKey: true,
    },
    // Kunci asing yang merujuk ke tabel users.
    user_id: {
        type: DataTypes.UUID,
        allowNull: false, // Wajib diisi.
    },
    // Kunci asing yang merujuk ke tabel categories.
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false, // Wajib diisi.
    }
}, {
    // Opsi tambahan untuk model.
    tableName: 'user_interests',
    // Nonaktifkan timestamps (createdAt, updatedAt) karena tidak ada di skema tabel.
    timestamps: false,
    // 2. Mengganti composite primary key menjadi unique index.
    // Ini memastikan pasangan user_id dan category_id tetap unik.
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'category_id']
        }
    ]
});

export default UserInterest;