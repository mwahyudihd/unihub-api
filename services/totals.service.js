import Organization from "../models/organization.model.js";
import User from "../models/user.model.js";

export const getDashboardSummary = async () => {
  const totalUser = await User.count({
    where: {
      role: "0a",
      is_verified: true,
    },
  });

  const totalOrganization = await Organization.count({
    where: {
      verification_status: "approved",
    },
  });

  return { totalUser, totalOrganization };
};