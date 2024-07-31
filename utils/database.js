import mongoose from "mongoose";

class Database {
  constructor(uri, Model) {
    this.uri = uri;
    this.Model = Model;
  }

  async connect() {
    await mongoose.connect(this.uri);
    console.log('Connected to MongoDB');
  }

  async findAll(query) { 
    const features = new APIFeatures(this.Model.find(), query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    
    const tours = await features.query;
    return tours;
  }

  async findById(id) { 
    const tour = await this.Model.findById(id)
    console.log(tour)
    return tour;
  }

  async create(data) { 
    return await this.Model.create(data);
  }

  async update(id, data) {
    return await this.Model.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.Model.findByIdAndDelete(id);
  }

}

export default Database;