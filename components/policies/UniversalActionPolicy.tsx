import React from 'react';

type Props = {
  usageCount: number;
  onChange: (value: number) => void;
  disabled: boolean;
};

// Static tooltip text
export const TOOLTIP_TEXT = "Restricts transactions based on specific call data. Can be used to allow only specific contract interactions. Coming soon (TM)";

const UniversalActionPolicy: React.FC<Props> = ({ usageCount, onChange, disabled }) => (
  <div className="mt-2">
    <label className="label">
      <span className="label-text">Usage Count</span>
    </label>
    <input
      type="number"
      value={usageCount}
      onChange={(e) => onChange(parseInt(e.target.value, 10) || 0)}
      className="input input-bordered"
      disabled={disabled}
    />
  </div>
);

export default UniversalActionPolicy; 