import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class User extends Model {
  static associate(models) {
    User.hasMany(models.Member, {
      foreignKey: "user_id",
      as: "memberships",
    });
  }
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    nim: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    profile_picture_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "0a",
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    prodi: {
      type: DataTypes.STRING(255),
      allowNull: false,
      defaultValue: "Belum diisi",
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contact: {
      type: DataTypes.TEXT, 
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default User;