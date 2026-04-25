import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { Datalogger } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';

const CalibrationTracking: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dataloggers, setDataloggers] = useState<Datalogger[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    const fetchDataloggers = async () => {
      const snap = await getDocs(collection(db, 'dataloggers'));
      setDataloggers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Datalogger)));
      setLoading(false);
    };
    fetchDataloggers();
  }, []);

  const getCalibrationStatus = (d: Datalogger) => {
    const now = new Date();
    const nextCal = new Date(d.nextCalibrationDate);
    const daysDiff = (nextCal.getTime() - now.getTime()) / (1000 * 3600 * 24);
    if (daysDiff < 0) return { status: 'OVERDUE', color: 'red' };
    if (daysDiff < 30) return { status: 'DUE_SOON', color: 'orange' };
    return { status: 'OK', color: 'green' };
  };

  const filteredData = useMemo(() => {
    return dataloggers.filter(d => d.name.toLowerCase().includes(filter.toLowerCase()));
  }, [dataloggers, filter]);

  const handleAction = (type: string, data?: Datalogger) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAction({ type, data });
    setModalOpen(true);
  };

  const confirmAction = async (pin: string) => {
    if (!action) return;
    const func = httpsCallable(functions, 'updateCalibration');
    try {
      await func({ dataloggerId: action.data.id, lastCalibrationDate: new Date().toISOString(), pin });
      const snap = await getDocs(collection(db, 'dataloggers'));
      setDataloggers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Datalogger)));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('calibration.title')}</h1>
      <div className="mb-4">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('calibration.filter')}
          className="w-full p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
      </div>
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">{t('calibration.name')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('calibration.lastDate')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('calibration.nextDate')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('calibration.status')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(d => {
              const { status, color } = getCalibrationStatus(d);
              return (
                <tr key={d.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                  <td className="p-3 text-sm">{d.name}</td>
                  <td className="p-3 text-sm text-xs">{new Date(d.lastCalibrationDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm text-xs">{new Date(d.nextCalibrationDate).toLocaleDateString()}</td>
                  <td className="p-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-semibold ${color === 'red' ? 'bg-darkAlertRed/20 text-darkAlertRed' : color === 'orange' ? 'bg-darkAlertOrange/20 text-darkAlertOrange' : 'bg-darkAlertGreen/20 text-darkAlertGreen'}`}>{t(`calibration.${status}`)}</span></td>
                  <td className="p-3 text-sm">
                    <button onClick={() => handleAction('update', d)} className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded transition-colors">{t('update')}</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PinModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={confirmAction} />
    </div>
  );
};

export default CalibrationTracking;
