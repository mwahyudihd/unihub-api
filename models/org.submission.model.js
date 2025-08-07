import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";

class OrganizationSubmission extends Model {
  static associate(models) {
    OrganizationSubmission.belongsTo(models.Organization, {
      foreignKey: "org_id",
      as: "organization",
    });

    OrganizationSubmission.belongsTo(models.User, {
      foreignKey: "submitted_by_user_id",
      as: "submitted_by_user",
    });

    OrganizationSubmission.belongsTo(models.User, {
      foreignKey: "verified_by_user_id",
      as: "verified_by_user",
    });

    //
      OrganizationSubmission.belongsTo(models.Organization, {
    foreignKey: 'org_id',
    as: 'sub_organization', // ✅ WAJIB match dengan include
  });

  }
}

OrganizationSubmission.init(
  {
    submission_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submitted_by_user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [["pending", "approved", "rejected"]],
      },
    },
    proof_document_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verified_by_user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'created_at', // ✅ mapping ke kolom sebenarnya di database
    },
  },
  {
    sequelize,
    modelName: "OrganizationSubmission",
    tableName: "organization_submissions",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
    underscored: true,
  }
);

export default OrganizationSubmission;
