import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Input, { Select } from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import screenTimeApi from '../../services/screenTimeApi.js';

const CATEGORIES = [
  { value: 'Productivity', label: 'Productivity (Code, Docs, Work)' },
  { value: 'Entertainment', label: 'Entertainment (Video, Music, Streaming)' },
  { value: 'Social', label: 'Social (Social Media, Feeds)' },
  { value: 'Communication', label: 'Communication (Chat, Email)' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Utilities', label: 'Utilities & Browsing' },
  { value: 'Other', label: 'Other' },
];

export function AddEditRecordModal({ isOpen, onClose, onSaved, record = null }) {
  const [applicationName, setApplicationName] = useState('');
  const [category, setCategory] = useState('Productivity');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [sessionCount, setSessionCount] = useState(1);
  const [deviceIdentifier, setDeviceIdentifier] = useState('Primary Device');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (record) {
      setApplicationName(record.applicationName || '');
      setCategory(record.category || 'Productivity');
      setDate(record.date || new Date().toISOString().split('T')[0]);
      setStartTime(record.startTime || '');
      setEndTime(record.endTime || '');
      setDurationMinutes(record.durationMinutes || 60);
      setSessionCount(record.sessionCount || 1);
      setDeviceIdentifier(record.deviceIdentifier || 'Primary Device');
    } else {
      setApplicationName('');
      setCategory('Productivity');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime('');
      setEndTime('');
      setDurationMinutes(60);
      setSessionCount(1);
      setDeviceIdentifier('Primary Device');
    }
    setErrorMessage('');
  }, [record, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!applicationName.trim()) {
      setErrorMessage('Application name is required.');
      return;
    }
    if (durationMinutes <= 0) {
      setErrorMessage('Duration must be greater than 0.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const payload = {
        applicationName: applicationName.trim(),
        category,
        date,
        durationMinutes: parseInt(durationMinutes, 10),
        sessionCount: parseInt(sessionCount, 10) || 1,
        startTime: startTime.trim() || null,
        endTime: endTime.trim() || null,
        deviceIdentifier: deviceIdentifier.trim() || 'Primary Device',
        source: record ? record.source : 'manual',
      };

      if (record && record._id) {
        await screenTimeApi.update(record._id, payload);
      } else {
        await screenTimeApi.create(payload);
      }

      onSaved();
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save record.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={record ? 'Edit Screen Time Entry' : 'Log Screen Time Entry'}
      description="Record manual application usage or session timestamps."
    >
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-medium">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="appName"
            label="Application Name"
            placeholder="e.g. Visual Studio Code, YouTube"
            value={applicationName}
            onChange={(e) => setApplicationName(e.target.value)}
            required
          />

          <Select
            id="category"
            label="Category"
            options={CATEGORIES}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="date"
            label="Date (YYYY-MM-DD)"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <Input
            id="duration"
            label="Duration (Minutes)"
            type="number"
            min="1"
            max="1440"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="startTime"
            label="Start Time (Optional, 24h)"
            placeholder="e.g. 23:15"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            helperText="Used to detect bedtime / late-night usage"
          />

          <Input
            id="endTime"
            label="End Time (Optional, 24h)"
            placeholder="e.g. 00:30"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            id="device"
            label="Device"
            placeholder="e.g. Laptop, Phone"
            value={deviceIdentifier}
            onChange={(e) => setDeviceIdentifier(e.target.value)}
          />

          <Input
            id="sessions"
            label="Session Count"
            type="number"
            min="1"
            value={sessionCount}
            onChange={(e) => setSessionCount(e.target.value)}
          />
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {record ? 'Save Changes' : 'Add Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default AddEditRecordModal;
