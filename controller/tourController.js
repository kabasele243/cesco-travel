import Tour from '../models/tourModel.js'
import tourService from '../services/tourService.js';
import AppError from '../utils/appError.js';

export const getAllTours = async (req, res) => {

  try {
    const tours = await tourService.findAll(req.query)

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });

  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

export const createTour = async(req, res) => {
  try {
    const tour = await tourService.create(req.body)

    res.status(201).json({
      status: 'success',
      data: {
        tour: tour
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }

};

export const getTour = async (req, res, next) => {
  try {
    const id = req.params.id;
    const tour = await tourService.findById(id);

    if(!tour) {
      return next(new AppError('No tour found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (error) {
    console.log(error)
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }

};

export const updateTour = async(req, res) => {
  try {

    const id = req.params.id;
    const updateTour = await tourService.update(id, req.body)

    if(!udpateTour) {
      return next(new AppError('No tour found with that ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        tour: updateTour
      },
    });

  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error
    });
  }
};

export const deleteTour = async (req, res) => {
  try {
    await tourService.delete(req.params.id)
    res.status(204).json({
          status: 'success',
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
};

export const getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } }
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      },
      {
        $sort: { avgPrice: 1 }
      }
      // {
      //   $match: { _id: { $ne: 'EASY' } }
      // }
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      message: error
    });
  }
}

export const getToursWithin = async (req, res, next) => {

  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }
};

export const getDistances = async (req, res, next) => {

  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');
  
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  
    if (!lat || !lng) {
      next(
        new AppError(
          'Please provide latitutr and longitude in the format lat,lng.',
          400
        )
      );
    }
  
    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);
  
    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'success',
      error
    });
  }
};

