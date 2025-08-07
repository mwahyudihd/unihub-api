import { DataTypes, Model } from "sequelize";
import { sequelize } from "../configs/db.config.js";
import User from "./user.model.js";
import Announcement from "./announcement.model.js";

class AnnouncementComment extends Model {
  static associate(models) {
    AnnouncementComment.belongsTo(User, { foreignKey: "user_id", as: "user" });
    AnnouncementComment.hasMany(AnnouncementComment, {
      foreignKey: "parent_comment_id",
      as: "replies",
    });
    AnnouncementComment.belongsTo(Announcement, {
      foreignKey: "announcement_id",
      as: "announcement",
    });
  }
}

AnnouncementComment.init(
  {
    comment_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    announcement_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    parent_comment_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "AnnouncementComment",
    tableName: "announcement_comments",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        name: "idx_comments_announcement_id",
        fields: ["announcement_id"],
      },
      {
        name: "idx_comments_parent_comment_id",
        fields: ["parent_comment_id"],
      },
    ],
  }
);

export default AnnouncementComment;
