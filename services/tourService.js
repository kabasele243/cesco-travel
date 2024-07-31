import Tour from "../models/tourModel.js";
import APIFeatures from "../utils/apiFeatures.js";

class TourService {
  constructor(tourModel) {
    this.tourModel = tourModel;
  }

  async findAll(query) { 
    const features = new APIFeatures(this.tourModel.find(), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;
    return tours;
  }

  async findById(id) { 
    const tour = await this.tourModel.findById(id)
    console.log(tour)
    return tour;
  }

  async create(tourData) { 
    return await this.tourModel.create(tourData);
  }

  async update(id, tourData) {
    return await this.tourModel.findByIdAndUpdate(id, tourData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.tourModel.findByIdAndDelete(id);
  }

  async getStats() { Stats
    // (Same aggregation pipeline as before)
  }

}

export default new TourService(Tour);

