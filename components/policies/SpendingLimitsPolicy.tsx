import React from 'react';

type Props = {
  value: number;
  onChange: (value: number) => void;
};

const SpendingLimitsPolicy: React.FC<Props> = ({ value, onChange }) => (
  <div className="mt-2">
    <label className="label">
      <span className="label-text">Limit</span>
    </label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="input input-bordered"
    />
  </div>
);

export default SpendingLimitsPolicy; 