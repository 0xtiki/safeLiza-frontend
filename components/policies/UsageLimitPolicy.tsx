import React from 'react';

type Props = {
  usageCount: number;
  onChange: (value: number) => void;
};

const UsageLimitPolicy: React.FC<Props> = ({ usageCount, onChange }) => (
  <div className="mt-2">
    <label className="label">
      <span className="label-text">Usage Count</span>
    </label>
    <input
      type="number"
      value={usageCount}
      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
      className="input input-bordered"
    />
  </div>
);

export default UsageLimitPolicy; 