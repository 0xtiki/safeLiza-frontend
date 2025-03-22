import React from 'react';

type Props = {
  active: boolean;
  onChange: (value: boolean) => void;
};

const SudoPolicy: React.FC<Props> = ({ active, onChange }) => (
  <div className="mt-2">
    <label className="label cursor-pointer">
      <span className="label-text">Sudo Policy Active</span>
      <input
        type="checkbox"
        checked={active}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox"
      />
    </label>
  </div>
);

export default SudoPolicy; 