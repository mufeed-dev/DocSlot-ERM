const Patient = require("../models/Patient");
const { NotFoundError } = require("../utils/error");

class PatientService {
  static async create(data) {
    try {
      const patient = new Patient(data);
      await patient.save();
      return patient;
    } catch (error) {
      throw error;
    }
  }

  static async search(queryStr) {
    try {
      if (!queryStr) return [];

      // Search by exact phone, exact patientId, or text search name
      const query = {
        $or: [
          { patientId: { $regex: queryStr, $options: "i" } },
          { phone: { $regex: queryStr, $options: "i" } },
          { name: { $regex: queryStr, $options: "i" } },
        ],
      };

      const patients = await Patient.find(query).limit(10);
      return patients;
    } catch (error) {
      throw error;
    }
  }

  static async getById(id) {
    try {
      const patient = await Patient.findById(id);
      if (!patient) {
        throw new NotFoundError("Patient not found");
      }
      return patient;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = PatientService;
