import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class Category extends Model {
  static associate(models) {
    // Relasi one-to-many ke table pivot
    Category.hasMany(models.OrganizationCategory, {
      foreignKey: 'category_id',
      as: 'organization_categories',
    });

    // Relasi many-to-many ke Organization via OrganizationCategory
    Category.belongsToMany(models.Organization, {
      through: models.OrganizationCategory,
      as: 'organizations',
      foreignKey: 'category_id',
    });
  }
}

Category.init(
  {
    category_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: false, // tidak ada created_at, updated_at
  }
);

export default Category;