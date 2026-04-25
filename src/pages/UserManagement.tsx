import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { User } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';

const UserManagement: React.FC = () => {
  const { t } = useTranslation();
  const { userData, user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<{ type: string; data?: any } | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredData = useMemo(() => {
    return users.filter(u => u.username.toLowerCase().includes(filter.toLowerCase()));
  }, [users, filter]);

  const handleAction = (type: string, data?: User) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAction({ type, data });
    setModalOpen(true);
  };

  const confirmAction = async (pin: string) => {
    if (!action) return;
    const func = httpsCallable(functions, action.type === 'create' ? 'createUser' : 'updateUserPermissions');
    try {
      await func({ ...action.data, pin });
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div>{t('loading')}</div>;
  if (!userData || userData.role !== 'ADMIN') return <div className="p-6">{t('accessDenied')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('users.title')}</h1>
      <div className="mb-4 flex gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('users.filter')}
          className="flex-1 p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
        <button onClick={() => handleAction('create')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">{t('create')}</button>
      </div>
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">{t('users.username')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('users.email')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('users.role')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('users.active')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('users.permissions')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(u => (
              <tr key={u.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                <td className="p-3 text-sm font-medium text-primary-300">{u.username}</td>
                <td className="p-3 text-sm text-xs">{u.email}</td>
                <td className="p-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'ADMIN' ? 'bg-darkAlertRed/20 text-darkAlertRed' : 'bg-primary-600/20 text-primary-300'}`}>{u.role}</span></td>
                <td className="p-3 text-sm"><span className={`px-2 py-1 rounded text-xs font-semibold ${u.active ? 'bg-darkAlertGreen/20 text-darkAlertGreen' : 'bg-darkAlertRed/20 text-darkAlertRed'}`}>{u.active ? 'Yes' : 'No'}</span></td>
                <td className="p-3 text-sm text-xs opacity-75">{u.permissions.length} permissions</td>
                <td className="p-3 text-sm">
                  <button onClick={() => handleAction('edit', u)} className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded transition-colors">{t('edit')}</button>
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

export default UserManagement;
