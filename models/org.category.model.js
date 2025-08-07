import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class OrganizationCategory extends Model {
  static associate(models) {
    OrganizationCategory.belongsTo(models.Organization, {
      foreignKey: "org_id",
      as: "organization",
    });

    OrganizationCategory.belongsTo(models.Category, {
      foreignKey: "category_id",
      as: "category",
    });
  }
}

OrganizationCategory.init(
  {
    org_category_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrganizationCategory",
    tableName: "organization_categories",
    timestamps: false,
    indexes: [
      {
        name: "idx_org_categories_org_id",
        fields: ["org_id"],
      },
      {
        name: "idx_org_categories_category_id",
        fields: ["category_id"],
      },
      {
        name: "unique_org_category",
        unique: true,
        fields: ["org_id", "category_id"],
      },
    ],
  }
);

export default OrganizationCategory;
