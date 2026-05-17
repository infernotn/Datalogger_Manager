import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { Datalogger } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';
import { FilterList, FilterListOff, RestartAlt, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import AddBoxIcon from '@mui/icons-material/AddBox';

const Dataloggers: React.FC = () => {
  const { t } = useTranslation();
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [dataloggers, setDataloggers] = useState<Datalogger[]>([]);
  const [loading, setLoading] = useState(true);
  // filters for columns
  const [filters, setFilters] = useState<{ name: string; type: string; measurementType: string; status: string }>({ name: '', type: '', measurementType: '', status: '' });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<{ type: string; data?: any } | null>(null);
  const [sortField, setSortField] = useState<'name' | 'type' | 'measurementType' | 'status' | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchDataloggers = async () => {
      const snap = await getDocs(collection(db, 'dataloggers'));
      setDataloggers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Datalogger)));
      setLoading(false);
    };
    fetchDataloggers();
  }, []);

  // derive unique values for dropdown filters
  const uniqueFilterValues = useMemo(() => {
    const types = new Set<string>();
    const measurements = new Set<string>();
    const statuses = new Set<string>();
    dataloggers.forEach(d => {
      if (d.type) types.add(String(d.type));
      const m = (d as any).measurementType;
      if (m) measurements.add(String(m));
      if (d.status) statuses.add(String(d.status));
    });
    return {
      types: Array.from(types).sort(),
      measurements: Array.from(measurements).sort(),
      statuses: Array.from(statuses).sort(),
    };
  }, [dataloggers]);

  const filteredData = useMemo(() => {
    const activeEntries = Object.entries(filters).filter(([, v]) => v && v.trim() !== '');
    if (activeEntries.length === 0) return dataloggers;

    return dataloggers.filter(d => {
      return activeEntries.every(([k, v]) => {
        const q = v.toLowerCase();
        const val =
          k === 'name' ? d.name :
          k === 'type' ? d.type :
          k === 'measurementType' ? (d as any).measurementType :
          /* status */ d.status;
        // exact match for dropdowns (type, measurementType, status), substring for name
        if (k === 'name') {
          return (val ?? '').toString().toLowerCase().includes(q);
        } else {
          return (val ?? '').toString().toLowerCase() === q;
        }
      });
    });
  }, [dataloggers, filters]);

  // Apply sorting to filtered data
  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = sortField === 'name' ? a.name :
        sortField === 'type' ? a.type :
        sortField === 'measurementType' ? (a as any).measurementType :
        /* status */ a.status;
      const bVal = sortField === 'name' ? b.name :
        sortField === 'type' ? b.type :
        sortField === 'measurementType' ? (b as any).measurementType :
        /* status */ b.status;
      const aStr = (aVal ?? '').toString().toLowerCase();
      const bStr = (bVal ?? '').toString().toLowerCase();
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [filteredData, sortField, sortDirection]);

  const handleSort = (field: 'name' | 'type' | 'measurementType' | 'status') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-2xl md:text-3xl font-bold">{t('dataloggers.title')}</h1>
        <div className="flex items-center gap-2">
          <Tooltip title={showFilters ? (t('hideFilters') || 'Hide filters') : (t('showFilters') || 'Show filters')} arrow>
            <button
              onClick={() => setShowFilters(s => !s)}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              {!showFilters ? <FilterList className="w-5 h-5" /> : <FilterListOff className="w-5 h-5" />}
            </button>
          </Tooltip>
          <Tooltip title={t('create')} arrow>
            <button
              onClick={() => handleAction('create')}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
              aria-label={t('create') as string}
            >
              <AddBoxIcon className="w-5 h-5" />
            </button>
          </Tooltip>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/50">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">
                <Tooltip title={sortField === 'name' ? (sortDirection === 'asc' ? 'Descending (Z-A)' : 'Ascending (A-Z)') : 'Click to sort'} arrow>
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 hover:text-primary-400 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {t('dataloggers.name')}
                    {sortField === 'name' ? (sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4 text-primary-400" /> : <ArrowDownward className="w-4 h-4 text-primary-400" />) : <ArrowUpward className="w-4 h-4 opacity-20" />}
                  </button>
                </Tooltip>
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                <Tooltip title={sortField === 'type' ? (sortDirection === 'asc' ? 'Descending (Z-A)' : 'Ascending (A-Z)') : 'Click to sort'} arrow>
                  <button
                    onClick={() => handleSort('type')}
                    className="flex items-center gap-1 hover:text-primary-400 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {t('dataloggers.type')}
                    {sortField === 'type' ? (sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4 text-primary-400" /> : <ArrowDownward className="w-4 h-4 text-primary-400" />) : <ArrowUpward className="w-4 h-4 opacity-20" />}
                  </button>
                </Tooltip>
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                <Tooltip title={sortField === 'measurementType' ? (sortDirection === 'asc' ? 'Descending (Z-A)' : 'Ascending (A-Z)') : 'Click to sort'} arrow>
                  <button
                    onClick={() => handleSort('measurementType')}
                    className="flex items-center gap-1 hover:text-primary-400 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {t('dataloggers.measurementType')}
                    {sortField === 'measurementType' ? (sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4 text-primary-400" /> : <ArrowDownward className="w-4 h-4 text-primary-400" />) : <ArrowUpward className="w-4 h-4 opacity-20" />}
                  </button>
                </Tooltip>
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                <Tooltip title={sortField === 'status' ? (sortDirection === 'asc' ? 'Descending (Z-A)' : 'Ascending (A-Z)') : 'Click to sort'} arrow>
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 hover:text-primary-400 transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {t('dataloggers.status')}
                    {sortField === 'status' ? (sortDirection === 'asc' ? <ArrowUpward className="w-4 h-4 text-primary-400" /> : <ArrowDownward className="w-4 h-4 text-primary-400" />) : <ArrowUpward className="w-4 h-4 opacity-20" />}
                  </button>
                </Tooltip>
              </th>
              <th className="p-3 text-left text-sm font-semibold">{t('actions')}</th>
            </tr>
            {showFilters && (
              <tr className="bg-darkAccent/20">
                <th className="p-2">
                  <input
                    value={filters.name}
                    onChange={(e) => setFilters(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={t('dataloggers.name')}
                    className="w-full p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500 text-sm"
                  />
                </th>
                <th className="p-2">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full p-2 bg-darkCard border border-darkAccent rounded text-darkText focus:outline-none text-sm"
                  >
                    <option value="">{t('all') || 'All'}</option>
                    {uniqueFilterValues.types.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="p-2">
                  <select
                    value={filters.measurementType}
                    onChange={(e) => setFilters(prev => ({ ...prev, measurementType: e.target.value }))}
                    className="w-full p-2 bg-darkCard border border-darkAccent rounded text-darkText focus:outline-none text-sm"
                  >
                    <option value="">{t('all') || 'All'}</option>
                    {uniqueFilterValues.measurements.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="p-2">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full p-2 bg-darkCard border border-darkAccent rounded text-darkText focus:outline-none text-sm"
                  >
                    <option value="">{t('all') || 'All'}</option>
                    {uniqueFilterValues.statuses.map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </th>
                <th className="p-2 flex justify-center">
                  <Tooltip title={t('clearFilters') || 'Clear filters'} arrow>
                    <button
                      onClick={() => setFilters({ name: '', type: '', measurementType: '', status: '' })}
                      className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded transition-colors"
                      aria-label={t('clearFilters') as string || 'Clear filters'}
                    >
                      <RestartAlt className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </th>

              </tr>
            )}
          </thead>
          <tbody>
            {sortedData.map(d => (
              <tr key={d.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                <td className="p-3 text-sm">{d.name}</td>
                <td className="p-3 text-sm">{d.type}</td>
                <td className="p-3 text-sm">{(d as any).measurementType ?? '-'}</td>
                <td className="p-3 text-sm"><span className="px-2 py-1 rounded text-xs bg-primary-600/20 text-primary-300">{d.status}</span></td>
                <td className="p-3 text-sm space-x-2 flex items-center">
                  <Tooltip title={t('edit')} arrow>
                    <button
                      onClick={() => handleAction('edit', d)}
                      className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                      aria-label={t('edit') as string}
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </Tooltip>
                  <Tooltip title={t('delete')} arrow>
                    <button
                      onClick={() => handleAction('delete', d)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      aria-label={t('delete') as string}
                    >
                      <DeleteIcon className="w-5 h-5" />
                    </button>
                  </Tooltip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PinModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAction}
        user={userData}
        onLoginRequired={() => navigate('/login')}
      />
    </div>
  );
};

export default Dataloggers;
