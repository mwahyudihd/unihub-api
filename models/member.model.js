import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class Member extends Model {
  static associate(models) {
    Member.belongsTo(models.Organization, {
      foreignKey: 'org_id',
      as: 'organization'
    });

    Member.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  }
}

Member.init(
  {
    member_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    jabatan: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "1c",
    },
    status: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "active", "inactive"]],
      },
    },
    joining_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Member",
    tableName: "members",
    timestamps: true,
    updatedAt: false,
    createdAt: "join_date", // custom timestamp name
    indexes: [
      {
        unique: true,
        fields: ["user_id", "org_id"],
      },
    ],
  }
);

export default Member;