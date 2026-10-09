import screenTimeRepository from '../repositories/screenTimeRepository.js';
import { parseScreenTimeCSV, exportScreenTimeToCSV } from '../utils/csvParser.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';

export const screenTimeService = {
  async createRecord(userId, data) {
    return screenTimeRepository.create({
      ...data,
      userId,
    });
  },

  async getRecordById(userId, id) {
    const record = await screenTimeRepository.findByIdAndUser(id, userId);
    if (!record) {
      throw new NotFoundError('Screen time record not found');
    }
    return record;
  },

  async updateRecord(userId, id, updateData) {
    const record = await screenTimeRepository.updateByIdAndUser(id, userId, updateData);
    if (!record) {
      throw new NotFoundError('Screen time record not found');
    }
    return record;
  },

  async deleteRecord(userId, id) {
    const record = await screenTimeRepository.deleteByIdAndUser(id, userId);
    if (!record) {
      throw new NotFoundError('Screen time record not found');
    }
    return record;
  },

  async getRecords(userId, queryParams) {
    return screenTimeRepository.findWithPagination(userId, queryParams);
  },

  async importCSV(userId, csvContent) {
    const { totalRows, validRows, rejectedRows } = parseScreenTimeCSV(csvContent);

    if (validRows.length === 0) {
      return {
        totalRows,
        importedCount: 0,
        duplicateCount: 0,
        rejectedCount: rejectedRows.length,
        rejectedRows,
        importedRecords: [],
      };
    }

    // Check existing records in the database to prevent duplicate insertion
    const signatures = validRows.map((r) => ({
      date: r.date,
      applicationName: r.applicationName,
      startTime: r.startTime || null,
    }));

    const existingDocs = await screenTimeRepository.findExistingSignatures(userId, signatures);
    const existingSet = new Set(
      existingDocs.map((d) => `${d.applicationName.toLowerCase()}_${d.date}_${d.startTime || 'daily'}`)
    );

    const nonDuplicateRows = [];
    let duplicateCount = 0;

    for (const row of validRows) {
      const key = `${row.applicationName.toLowerCase()}_${row.date}_${row.startTime || 'daily'}`;
      if (existingSet.has(key)) {
        duplicateCount++;
      } else {
        nonDuplicateRows.push({
          ...row,
          userId,
        });
      }
    }

    let insertedRecords = [];
    if (nonDuplicateRows.length > 0) {
      insertedRecords = await screenTimeRepository.insertMany(nonDuplicateRows);
    }

    return {
      totalRows,
      importedCount: insertedRecords.length,
      duplicateCount,
      rejectedCount: rejectedRows.length,
      rejectedRows,
    };
  },

  async exportCSV(userId) {
    const records = await screenTimeRepository.findByUserAndDateRange(userId);
    return exportScreenTimeToCSV(records);
  },
};

export default screenTimeService;
