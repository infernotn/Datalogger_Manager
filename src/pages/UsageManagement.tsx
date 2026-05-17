import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase/config';
import type { Usage } from '../types';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import PinModal from '../components/PinModal';
import SelectDataLoggerModal from '../components/SelectDataLoggerModal';

/**
 * UsageManagement Page
 *
 * Displays a table of datalogger usages and allows authorized users to:
 * - Assign new usages (with PIN verification)
 * - Close active usages (with PIN verification)
 * - Filter usages by location
 *
 * All sensitive actions require PIN authentication via modal confirmation.
 */
const UsageManagement: React.FC = () => {
  // Localization hook for multi-language support
  const { t } = useTranslation();
  // Current authenticated user from context
  const { user } = useAuth();
  // Router navigation for redirecting to login if needed
  const navigate = useNavigate();

  // ============ STATE MANAGEMENT ============
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [action, setAction] = useState<{ type: string; data?: any } | null>(null);

  // ============ FETCH USAGES ON MOUNT ============
  /**
   * Fetches all usages from Firestore collection on component initialization.
   * Sets loading state to false once data is retrieved.
   */
  useEffect(() => {
    const fetchData = async () => {
      const usagesSnap = await getDocs(collection(db, 'usages'));
      setUsages(usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usage)));
      setLoading(false);
    };
    fetchData();
  }, []);

  // ============ FILTER USAGES BY LOCATION ============
  /**
   * Memoized filter function that efficiently filters usages based on location input.
   * Recalculates only when usages array or filter text changes.
   * Performs case-insensitive search on location field.
   */
  const filteredData = useMemo(() => {
    return usages.filter(u => u.location.toLowerCase().includes(filter.toLowerCase()));
  }, [usages, filter]);

  // ============ ACTION HANDLERS ============
  /**
   * Initiates an action (assign or close usage).
   *
   * @param type - Action type: 'assign' or 'close'
   * @param data - Optional usage data for the action
   *
   * Redirects to login if user is not authenticated.
   * Opens PIN confirmation modal for security verification.
   */
  const handleAction = (type: string, data?: Usage) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setAction({ type, data });
    setModalOpen(true);
  };

  /**
   * Confirms action after PIN verification and executes the corresponding Firebase Function.
   *
   * @param pin - PIN code entered by user for verification
   *
   * After successful execution:
   * - Refreshes the usages list from Firestore
   * - Closes the PIN modal
   * - Logs any errors to console
   */
  const confirmAction = async (pin: string) => {
    if (!action) return;
    const func = httpsCallable(functions, action.type === 'assign' ? 'assignUsage' : 'closeUsage');
    try {
      await func({ ...action.data, pin });
      // Refresh usages after successful action
      const usagesSnap = await getDocs(collection(db, 'usages'));
      setUsages(usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usage)));
    } catch (error) {
      console.error(error);
    }
  };

  // Loading state check - display loading message while data is being fetched
  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      {/* Page header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('usage.title')}</h1>

      {/* ============ FILTER & ACTION BAR ============ */}
      <div className="mb-4 flex gap-2">
        {/* Location filter input - allows case-insensitive search */}
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('usage.filter')}
          className="flex-1 p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
        {/* Assign new usage button - opens PIN modal for security verification */}
        <button onClick={() => handleAction('assign')} className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition-colors">{t('assign')}</button>
      </div>

      {/* ============ USAGES TABLE ============ */}
      <div className="overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          {/* Table header with column labels */}
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
          {/* Table body - displays filtered usages with action buttons */}
          <tbody>
            {filteredData.map(u => (
              <tr key={u.id} className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors">
                <td className="p-3 text-sm">{u.dataloggerId}</td>
                <td className="p-3 text-sm">{u.usageType}</td>
                {/* Format start date to locale string */}
                <td className="p-3 text-sm text-xs">{new Date(u.startDate).toLocaleDateString()}</td>
                {/* End date - shows "ACTIVE" badge if no end date (usage still ongoing) */}
                <td className="p-3 text-sm text-xs">{u.endDate ? new Date(u.endDate).toLocaleDateString() : <span className="text-primary-300 font-semibold">{t('active')}</span>}</td>
                <td className="p-3 text-sm">{u.location}</td>
                {/* Action buttons - Close button only visible for active usages (!u.endDate) */}
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

      {/* ============ PIN CONFIRMATION MODAL ============ */}
      {/* Modal for PIN verification before executing sensitive actions (assign/close) */}
      {/*<PinModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onConfirm={confirmAction} />*/}
    <SelectDataLoggerModal isOpen={true}  onClose={()=>{}}

                           onSave={()=>{}}
                           dataloggers={[{
      id: "1",
      name: "DL-001"
    },{
        id: "2",
        name: "DL-002"
    } ]} />
    </div>

  );
};

export default UsageManagement;
