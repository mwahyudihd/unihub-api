import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class Organization extends Model {
  static associate(models) {
    Organization.hasMany(models.OrganizationCategory, {
      foreignKey: "org_id",
      as: "organization_categories",
    });

    Organization.hasMany(models.OrganizationSubmission, {
      foreignKey: "org_id",
      as: "submissions",
    });

    Organization.belongsToMany(models.Category, {
      through: models.OrganizationCategory,
      as: "categories",
      foreignKey: "org_id",
    });

    Organization.hasMany(models.OrganizationCategory, {
      as: "org_category",
      foreignKey: "org_id",
    });

    Organization.hasMany(models.Member, {
      as: "members",
      foreignKey: "org_id",
    });
  }
}

Organization.init(
  {
    org_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    logo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verification_status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
      validate: {
        isIn: [["pending", "approved", "rejected"]],
      },
    },
    recruitment_status: {
      type: DataTypes.ENUM("open", "closed"),
      allowNull: false,
      defaultValue: "closed",
    },
  },
  {
    sequelize,
    modelName: "Organization",
    tableName: "organizations",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Organization;