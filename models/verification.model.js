import { DataTypes } from 'sequelize';
import { sequelize } from '../configs/db.config.js';

const Verification = sequelize.define('Verification', {
    verification_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    verification_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // Validasi untuk memastikan tipe yang masuk sesuai.
        validate: {
            isIn: [['account_activation', 'password_reset']],
        }
    },
    verification_code: {
        type: DataTypes.STRING(10),
        allowNull: false,
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    expired_at: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'verifications',
    // Hanya ada `created_at`, jadi kita nonaktifkan `updatedAt`.
    timestamps: true,
    updatedAt: false,
    createdAt: 'created_at',
    // Menambahkan index sesuai skema.
    indexes: [
        {
            fields: ['user_id']
        }
    ]
});

export default Verification;