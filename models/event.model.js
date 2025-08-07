import { DataTypes } from "sequelize";
import { sequelize } from "../configs/db.config.js";

const Event = sequelize.define('Event', {
    // Kunci utama untuk tabel event.
    event_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Otomatis menghasilkan UUID untuk event baru.
        primaryKey: true,
    },
    // Kunci asing ke tabel organizations, menandakan event ini milik organisasi mana.
    org_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Kunci asing ke tabel users, menandakan admin yang membuat event.
    created_by_user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    // Judul event, wajib diisi.
    title: {
        type: DataTypes.STRING(200),
        allowNull: false,
    },
    // Deskripsi event, boleh kosong.
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    // Waktu mulai event, wajib diisi.
    start_time: {
        type: DataTypes.DATE, // Sesuai dengan TIMESTAMPTZ.
        allowNull: false,
    },
    // Waktu selesai event, wajib diisi.
    end_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    // Lokasi event, boleh kosong.
    location: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    // Token unik untuk QR code presensi.
    qr_code_token: {
        type: DataTypes.TEXT,
        unique: true, // Token harus unik.
        allowNull: true,
    },
    // Waktu kedaluwarsa untuk token QR code.
    token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    // createdAt dan updatedAt akan ditangani secara otomatis oleh Sequelize.
}, {
    // Opsi tambahan untuk model.
    tableName: 'events',
    // Mengaktifkan timestamps dan memetakan ke nama kolom snake_case.
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
});

export default Event;