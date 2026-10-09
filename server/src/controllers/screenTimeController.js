import screenTimeService from '../services/screenTimeService.js';
import ApiResponse from '../utils/apiResponse.js';
import { BadRequestError } from '../utils/errors.js';

export const screenTimeController = {
  async create(req, res, next) {
    try {
      const record = await screenTimeService.createRecord(req.user._id, req.body);
      return ApiResponse.success(res, 201, record);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const result = await screenTimeService.getRecords(req.user._id, req.query);
      return ApiResponse.success(res, 200, result.records, result.pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const record = await screenTimeService.getRecordById(req.user._id, req.params.id);
      return ApiResponse.success(res, 200, record);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const record = await screenTimeService.updateRecord(req.user._id, req.params.id, req.body);
      return ApiResponse.success(res, 200, record);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await screenTimeService.deleteRecord(req.user._id, req.params.id);
      return ApiResponse.success(res, 200, { message: 'Record deleted successfully' });
    } catch (error) {
      next(error);
    }
  },

  async importCSV(req, res, next) {
    try {
      let csvContent = '';
      if (typeof req.body === 'string') {
        csvContent = req.body;
      } else if (req.body && req.body.csv) {
        csvContent = req.body.csv;
      } else {
        throw new BadRequestError('Request must include CSV text in body or "csv" property');
      }

      const result = await screenTimeService.importCSV(req.user._id, csvContent);
      return ApiResponse.success(res, 200, result);
    } catch (error) {
      next(error);
    }
  },

  async exportCSV(req, res, next) {
    try {
      const csvString = await screenTimeService.exportCSV(req.user._id);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="screentime_export.csv"');
      return res.status(200).send(csvString);
    } catch (error) {
      next(error);
    }
  },
};

export default screenTimeController;
