import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";
import User from "./user.model.js";
import Organization from "./organization.model.js";
import AnnouncementComment from "./comments.model.js";

class Announcement extends Model {
  static associate(models) {
    Announcement.belongsTo(User, { foreignKey: "author_id", as: "author" });
    Announcement.belongsTo(Organization, {
      foreignKey: "org_id",
      as: "organization",
    });
    Announcement.hasMany(AnnouncementComment, {
      foreignKey: "announcement_id",
      as: "comments",
    });
  }
}

Announcement.init(
  {
    announcement_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    org_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    image_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "announcements",
    modelName: "Announcement",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Announcement;
