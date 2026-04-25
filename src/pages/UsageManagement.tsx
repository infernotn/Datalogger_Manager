import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { Usage } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';

const UsageManagement: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const usagesSnap = await getDocs(collection(db, 'usages'));
      setUsages(usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usage)));
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return usages.filter(u => u.location.toLowerCase().includes(filter.toLowerCase()));
  }, [usages, filter]);

  const handleAction = (type: string, data?: Usage) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAction({ type, data });
    setModalOpen(true);
  };

  const confirmAction = async (pin: string) => {
    if (!action) return;
    const func = httpsCallable(functions, action.type === 'assign' ? 'assignUsage' : 'closeUsage');
    try {
      await func({ ...action.data, pin });
      const usagesSnap = await getDocs(collection(db, 'usages'));
      setUsages(usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usage)));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('usage.title')}</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('usage.filter')}
          className="flex-1 p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
        <button onClick={() => handleAction('assign')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">{t('assign')}</button>
      </div>
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">{t('usage.datalogger')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('usage.type')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('usage.startDate')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('usage.endDate')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('usage.location')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(u => (
              <tr key={u.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                <td className="p-3 text-sm">{u.dataloggerId}</td>
                <td className="p-3 text-sm">{u.usageType}</td>
                <td className="p-3 text-sm text-xs">{new Date(u.startDate).toLocaleDateString()}</td>
                <td className="p-3 text-sm text-xs">{u.endDate ? new Date(u.endDate).toLocaleDateString() : <span className="text-primary-300 font-semibold">{t('active')}</span>}</td>
                <td className="p-3 text-sm">{u.location}</td>
                <td className="p-3 text-sm">
                  {!u.endDate && (
                    <button onClick={() => handleAction('close', u)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors">{t('close')}</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PinModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={confirmAction} />
    </div>
  );
};

export default UsageManagement;
