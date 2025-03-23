import React from 'react';

type Props = {
  valueLimit: number;
  onChange: (value: number) => void;
};

// Static tooltip text
export const TOOLTIP_TEXT = "Sets a ETH spending limit. Once the limit is reached all subsequent transactions will be reverted.";

const ValueLimitPolicy: React.FC<Props> = ({ valueLimit, onChange }) => (
  <div className="mt-2">
    <label className="label">
      <span className="label-text">Value Limit</span>
    </label>
    <input
      type="number"
      value={valueLimit}
      onChange={(e) => onChange(parseFloat((e.target.value)) || 0)}
      className="input input-bordered"
    />
  </div>
);

export default ValueLimitPolicy; 