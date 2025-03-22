import React from 'react';

type Props = {
  startTime: string;
  endTime: string;
  onChange: (field: string, value: string) => void;
};

const TimeFramePolicy: React.FC<Props> = ({ startTime, endTime, onChange }) => (
  <div className="mt-2">
    <label className="label">
      <span className="label-text">Start Time</span>
    </label>
    <input
      type="datetime-local"
      value={startTime}
      onChange={(e) => onChange('startTime', e.target.value)}
      className="input input-bordered"
    />
    <label className="label">
      <span className="label-text">End Time</span>
    </label>
    <input
      type="datetime-local"
      value={endTime}
      onChange={(e) => onChange('endTime', e.target.value)}
      className="input input-bordered"
    />
  </div>
);

export default TimeFramePolicy; 