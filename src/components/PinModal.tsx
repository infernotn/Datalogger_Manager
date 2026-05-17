import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useTranslation } from 'react-i18next';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  title?: string;
  user?: any;
  onLoginRequired?: () => void;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onConfirm, title, user, onLoginRequired }) => {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  // If not logged in, show login prompt instead of PIN dialog
  if (isOpen && user) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
          <div className="relative bg-darkCard p-6 rounded-lg shadow-xl w-full max-w-sm border border-darkAccent">
            <Dialog.Title className="text-lg font-bold mb-4 text-darkText">{t('auth.required') || 'Login Required'}</Dialog.Title>
            <p className="text-darkText mb-6">{t('auth.pleaseLoginFirst') || 'Please login first to continue'}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                {t('close') || 'Close'}
              </button>
              <button
                onClick={() => {
                  handleConfirm();
                  onLoginRequired?.();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              >
                {t('login') || 'Login'}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  const handleConfirm = () => {
    if (!pin || pin.length === 0) {
      setError(t('pinModal.required'));
      return;
    }
    // Validate PIN against user data
    if (user && user.pin && user.pin !== pin) {
      setError(t('pinModal.incorrect') || 'Incorrect PIN');
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
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />
        <div className="relative bg-darkCard p-6 rounded-lg shadow-xl w-full max-w-sm border border-darkAccent">
          <Dialog.Title className="text-lg font-bold mb-4 text-darkText">{title || t('pinModal.title')}</Dialog.Title>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder={t('pinModal.placeholder')}
            className="w-full p-2 bg-darkBg border border-darkAccent rounded mb-2 text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
          <div className="flex justify-end gap-2">
            <button onClick={handleClose} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors">
              {t('pinModal.cancel')}
            </button>
            <button onClick={handleConfirm} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors">
              {t('pinModal.confirm')}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default PinModal;

