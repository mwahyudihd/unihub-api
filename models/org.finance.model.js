import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class OrganizationFinance extends Model {
  static associate(models) {
    // Transaksi keuangan terkait organisasi
    OrganizationFinance.belongsTo(models.Organization, {
      foreignKey: "org_id",
      as: "organization",
      onDelete: "CASCADE",
    });

    OrganizationFinance.belongsTo(models.User, {
        foreignKey: 'recorded_by_user_id',
        as: 'recorder'
    });

  }
}

OrganizationFinance.init(
  {
    transaction_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    transaction_type: {
      type: DataTypes.STRING(7),
      allowNull: false,
      validate: {
        isIn: [["income", "expense"]],
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    transaction_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    receipt_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recorded_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "OrganizationFinance",
    tableName: "organization_finances",
    timestamps: false,
    indexes: [
      {
        fields: ["org_id"],
      },
      {
        fields: ["transaction_date"],
      },
    ],
  }
);

export default OrganizationFinance;