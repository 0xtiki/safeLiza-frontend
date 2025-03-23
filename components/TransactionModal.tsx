import React, { useState } from 'react';

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (txData: {
    to: string;
    value: string;
    data: string;
  }) => Promise<void>;
  isLoading: boolean;
};

const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}) => {
  const [to, setTo] = useState('');
  const [value, setValue] = useState('');
  const [data, setData] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!to) {
      setError('Recipient address is required');
      return;
    }

    try {
      await onSubmit({ to, value, data });
      // Reset form on successful submission
      setTo('');
      setValue('');
      setData('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create Transaction</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">To Address</span>
            </label>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="input input-bordered"
              placeholder="0x..."
            />
          </div>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Value (ETH)</span>
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="input input-bordered"
              placeholder="0.0"
            />
          </div>
          
          <div className="form-control mb-4">
            <label className="label">
              <span className="label-text">Data (hex)</span>
            </label>
            <textarea
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="textarea textarea-bordered"
              placeholder="0x..."
            ></textarea>
          </div>
          
          {error && (
            <div className="alert alert-error mb-4">
              <span>{error}</span>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal; 