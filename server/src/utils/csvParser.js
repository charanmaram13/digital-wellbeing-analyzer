import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { BadRequestError } from './errors.js';

const ALLOWED_CATEGORIES = [
  'Social',
  'Entertainment',
  'Productivity',
  'Gaming',
  'Communication',
  'Utilities',
  'Other',
];

/**
 * Validates and parses raw CSV content for screen time imports.
 * Supported headers: applicationName, category, date, durationMinutes, [startTime], [endTime], [sessionCount], [deviceIdentifier]
 */
export function parseScreenTimeCSV(csvContent) {
  if (!csvContent || typeof csvContent !== 'string') {
    throw new BadRequestError('CSV content must be non-empty string');
  }

  let records;
  try {
    records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw new BadRequestError(`Malformed CSV file: ${err.message}`);
  }

  if (!records || records.length === 0) {
    throw new BadRequestError('CSV file contains no data rows');
  }

  if (records.length > 5000) {
    throw new BadRequestError('CSV file exceeds maximum row limit of 5,000 rows');
  }

  const validRows = [];
  const rejectedRows = [];
  const seenKeys = new Set();

  records.forEach((row, index) => {
    const rowNum = index + 2; // header is row 1
    const app = row.applicationName || row.application || row.app_name;
    const cat = row.category;
    const date = row.date;
    const duration = parseInt(row.durationMinutes || row.duration || row.minutes, 10);
    const startTime = row.startTime || row.start_time || undefined;
    const endTime = row.endTime || row.end_time || undefined;
    const sessionCount = parseInt(row.sessionCount || row.sessions || '1', 10);
    const device = row.deviceIdentifier || row.device || 'Primary Device';

    const errors = [];
    if (!app || app.trim().length === 0) errors.push('Missing application name');
    if (!cat) errors.push('Missing category');
    else if (!ALLOWED_CATEGORIES.includes(cat)) {
      // Auto-normalize if case issue or fallback to Other
      const normalizedCat = ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === cat.toLowerCase());
      if (!normalizedCat) {
        errors.push(`Invalid category "${cat}". Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
      }
    }

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      errors.push('Date must be formatted as YYYY-MM-DD');
    }

    if (isNaN(duration) || duration <= 0 || duration > 1440) {
      errors.push('Duration must be a positive integer <= 1440 minutes');
    }

    if (errors.length > 0) {
      rejectedRows.push({ row: rowNum, errors, raw: row });
      return;
    }

    const normalizedCategory =
      ALLOWED_CATEGORIES.find((c) => c.toLowerCase() === cat.toLowerCase()) || 'Other';

    // Duplicate detection within CSV
    const duplicateKey = `${app.trim().toLowerCase()}_${date}_${startTime || 'daily'}`;
    if (seenKeys.has(duplicateKey)) {
      rejectedRows.push({
        row: rowNum,
        errors: [`Duplicate entry inside file for ${app} on ${date} (${startTime || 'aggregate'})`],
        raw: row,
      });
      return;
    }
    seenKeys.add(duplicateKey);

    validRows.push({
      applicationName: app.trim(),
      category: normalizedCategory,
      date,
      startTime: startTime || null,
      endTime: endTime || null,
      durationMinutes: duration,
      sessionCount: isNaN(sessionCount) || sessionCount < 1 ? 1 : sessionCount,
      source: 'CSV',
      deviceIdentifier: device.trim(),
    });
  });

  return {
    totalRows: records.length,
    validRows,
    rejectedRows,
  };
}

/**
 * Generates CSV string from ScreenTimeRecords.
 */
export function exportScreenTimeToCSV(records) {
  const formatted = records.map((r) => ({
    applicationName: r.applicationName,
    category: r.category,
    date: r.date,
    durationMinutes: r.durationMinutes,
    startTime: r.startTime || '',
    endTime: r.endTime || '',
    sessionCount: r.sessionCount || 1,
    source: r.source || 'manual',
    deviceIdentifier: r.deviceIdentifier || 'Primary Device',
  }));

  return stringify(formatted, {
    header: true,
    columns: [
      'applicationName',
      'category',
      'date',
      'durationMinutes',
      'startTime',
      'endTime',
      'sessionCount',
      'source',
      'deviceIdentifier',
    ],
  });
}
