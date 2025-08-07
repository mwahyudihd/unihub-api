import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.config.js";

const EventAttendance = sequelize.define('EventAttendance', {
    // Kunci utama untuk setiap record presensi.
    attendance_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Otomatis menghasilkan UUID.
        primaryKey: true,
    },
    // Kunci asing ke tabel events.
    event_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Kunci asing ke tabel users, menandakan siapa yang hadir.
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Waktu presensi (scan) akan ditangani oleh `createdAt` dari Sequelize.
}, {
    // Opsi tambahan untuk model.
    tableName: 'event_attendance',
    
    // Mengaktifkan timestamps, tapi hanya untuk `createdAt` yang kita petakan ke `scan_time`.
    // Kolom `updatedAt` tidak ada di skema, jadi dinonaktifkan.
    timestamps: true,
    updatedAt: false,
    createdAt: 'scan_time',

    // Menambahkan constraint UNIQUE komposit.
    // Ini memastikan seorang pengguna (user_id) hanya bisa tercatat sekali
    // untuk sebuah event (event_id).
    indexes: [
        {
            unique: true,
            fields: ['event_id', 'user_id']
        }
    ]
});

export default EventAttendance;