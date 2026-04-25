import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onConfirm, title }) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!pin || pin.length === 0) {
      setError(t('pinModal.required'));
      return;
    }
    onConfirm(pin);
    setPin('');
    setError('');
    onClose();
  };

  const handleClose = () => {
    setPin('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
        <div className="relative bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
          <Dialog.Title className="text-lg font-bold mb-4">{title || t('pinModal.title')}</Dialog.Title>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t('pinModal.placeholder')}
            className="w-full p-2 border border-gray-300 rounded mb-2"
            onKeyPress={(e) => e.key === 'Enter' && handleConfirm()}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              {t('pinModal.cancel')}
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              {t('pinModal.confirm')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PinModal;

