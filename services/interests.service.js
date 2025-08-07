import UserInterest from "../models/usr.interest.model.js";

export const createInterest = async (interestData) => {
  // Membuat entitas interest baru.
  const newInterest = await UserInterest.create(interestData);
  return newInterest.toJSON();
}

export const findAllInterests = async () => {
  // Mengambil semua entitas interest.
  return UserInterest.findAll();
}
export const findInterestByUserId = async (userId) => {
  // Mengambil semua interest berdasarkan user_id.
  return UserInterest.findAll({
    where: { user_id: userId }
  });
}
export const findInterestByCategoryId = async (categoryId) => {
  // Mengambil semua interest berdasarkan category_id.
  return UserInterest.findAll({
    where: { category_id: categoryId }
  });
}
export const removeInterest = async (interestId) => {
    // Mencari interest berdasarkan ID.
    const interest = await findInterestById(interestId);
    if (!interest) {
        throw new Error('Interest not found');
    }
    // Menghapus entitas interest dari database.
    await interest.destroy();
    return { message: 'Interest deleted successfully' };
}

export const findInterestById = async (interestId) => {
  // Mencari interest berdasarkan ID.
  const interest = await UserInterest.findByPk(interestId);
  if (!interest) {
    throw new Error('Interest not found');
  }
  return interest;
}
export const updateInterest = async (interestId, updateData) => {
  // Mencari interest berdasarkan ID.
  const interest = await findInterestById(interestId);
  
  // Melakukan update pada entitas interest.
  const updatedInterest = await interest.update(updateData);
  return updatedInterest.toJSON();
}