import { createInterest, findAllInterests, findInterestByCategoryId, findInterestById, findInterestByUserId, removeInterest, updateInterest } from "../services/interests.service.js";

export const getAllInterests = async (request, reply) => {
  try {
    const interests = await findAllInterests();
    reply.code(200).send({
      message: "Interests retrieved successfully",
      statusCode: 200,
      data: interests
    });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error', error: error.message, statusCode: 500 });
  }
}

export const getInterestByUserId = async (request, reply) => {
  try {
    const userId = request.params.id;
    const interests = await findInterestByUserId(userId);
    reply.code(200).send({
      message: "Interests for user retrieved successfully",
      statusCode: 200,
      data: interests
    });
  } catch (error) {
    reply.code(404).send({ 
      message: error.message,
      statusCode: 404
    });
  }
}

export const getInterestByCategoryId = async (request, reply) => {
  try {
    const categoryId = request.params.id;
    const interests = await findInterestByCategoryId(categoryId);
    reply.code(200).send({
      message: "Interests for category retrieved successfully",
      statusCode: 200,
      data: interests
    });
  } catch (error) {
    reply.code(404).send({ 
      message: error.message,
      statusCode: 404
    });
  }
}

export const addInterest = async (request, reply) => {
  try {
    const interestData = request.body;
    const newInterest = await createInterest(interestData);
    reply.code(201).send({ 
      message: "Interest created successfully",
      statusCode: 201,
      data: newInterest 
    });
  } catch (error) {
    reply.code(500).send({ message: 'Internal Server Error', statusCode: 500, error: error.message });
  }
}
export const deleteInterest = async (request, reply) => {
  try {
    const interestId = request.params.id; // Assuming the ID is passed as a URL parameter
    const result = await removeInterest(interestId);
    reply.code(200).send({
      message: result.message,
      statusCode: 200
    });
  } catch (error) {
    reply.code(404).send({ 
      message: error.message,
      statusCode: 404
    });
  }
}

export const getInterest = async (request, reply) => {
  try {
    const interestId = request.params.id; // Assuming the ID is passed as a URL parameter
    const interest = await findInterestById(interestId);
    reply.code(200).send({
      message: "Interest retrieved successfully",
      statusCode: 200,
      data: interest
    });
  } catch (error) {
    reply.code(404).send({ 
      message: error.message,
      statusCode: 404
    });
  }
}

export const modifyInterest = async (request, reply) => {
  try {
    const interestId = request.params.id; // Assuming the ID is passed as a URL parameter
    const updateData = request.body; // Data to update the interest
    const updatedInterest = await updateInterest(interestId, updateData);
    reply.code(200).send({
      message: "Interest updated successfully",
      statusCode: 200,
      data: updatedInterest
    });
  } catch (error) {
    reply.code(404).send({ 
      message: error.message,
      statusCode: 404
    });
  }
}