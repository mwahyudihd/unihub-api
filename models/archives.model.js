import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class OrganizationArchive extends Model {}

OrganizationArchive.init(
  {
    archive_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "org_id",
      },
      onDelete: "CASCADE",
    },

    uploaded_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
      onDelete: "SET NULL",
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    gdrive_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    archive_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "dokumentasi",
    },
    visibility: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "private",
      validate: {
        isIn: [["public", "private"]],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrganizationArchive",
    tableName: "organization_archives",
    timestamps: false,
    indexes: [
      {
        name: "idx_archives_org_id",
        fields: ["org_id"],
      },
    ],
  }
);

export default OrganizationArchive;
