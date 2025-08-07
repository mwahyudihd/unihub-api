import Organization from './organization.model.js';
import OrganizationCategory from './org.category.model.js';
import Category from './category.model.js';
import OrganizationSubmission from './org.submission.model.js';
import User from './user.model.js';
import Member from './member.model.js';
import OrganizationFinance from './org.finance.model.js';
import Announcement from './announcement.model.js';
import AnnouncementComment from './comments.model.js';

const models = {
  Organization,
  OrganizationCategory,
  Category,
  OrganizationSubmission,
  User,
  Member,
  OrganizationFinance,
  Announcement,
  AnnouncementComment
};

// ⬇️ Inisialisasi semua relasi (associations)
for (const modelName in models) {
  const model = models[modelName];
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
}

export default models;