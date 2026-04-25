import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { Datalogger } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';

const Dataloggers: React.FC = () => {
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
    const func = httpsCallable(functions, action.type === 'create' ? 'createDatalogger' : action.type === 'edit' ? 'updateDatalogger' : 'deleteDatalogger');
    try {
      await func({ ...action.data, pin });
      const snap = await getDocs(collection(db, 'dataloggers'));
      setDataloggers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Datalogger)));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('dataloggers.title')}</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('dataloggers.filter')}
          className="flex-1 p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
        <button onClick={() => handleAction('create')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">{t('create')}</button>
      </div>
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">{t('dataloggers.name')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('dataloggers.type')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('dataloggers.status')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(d => (
              <tr key={d.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                <td className="p-3 text-sm">{d.name}</td>
                <td className="p-3 text-sm">{d.type}</td>
                <td className="p-3 text-sm"><span className="px-2 py-1 rounded text-xs bg-primary-600/20 text-primary-300">{d.status}</span></td>
                <td className="p-3 text-sm space-x-2">
                  <button onClick={() => handleAction('edit', d)} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors">{t('edit')}</button>
                  <button onClick={() => handleAction('delete', d)} className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded transition-colors">{t('delete')}</button>
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

export default Dataloggers;
