import React, { useEffect, useState, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { AuditLog } from '../types';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MoreVert } from '@mui/icons-material';

const AuditTrail: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const snap = await getDocs(collection(db, 'auditLogs'));
        setLogs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog)));
      } catch (error) {
        console.error('Error fetching audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredData = useMemo(() => {
    return logs.filter(l => l.action.toLowerCase().includes(filter.toLowerCase()));
  }, [logs, filter]);

  if (loading) return <div className="p-6">{t('loading')}</div>;

  return (
    <div className="p-4 md:p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">{t('audit.title')}</h1>

      <div className="mb-4 flex gap-2">
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder={t('audit.filter')}
          className="flex-1 p-2 bg-darkCard border border-darkAccent rounded text-darkText placeholder-darkAccent focus:outline-none focus:border-primary-500"
        />
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-lg bg-darkCard shadow-lg">
        <table className="w-full">
          <thead className="bg-darkAccent/20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold">{t('audit.user')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('audit.action')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('audit.entity')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('audit.timestamp')}</th>
              <th className="p-3 text-left text-sm font-semibold">{t('audit.changes')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((l, i) => (
              <motion.tr
                key={l.id}
                className="border-b border-darkAccent/30 hover:bg-darkAccent/10 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <td className="p-3 text-sm">{l.userId}</td>
                <td className="p-3 text-sm font-medium text-primary-300">{l.action}</td>
                <td className="p-3 text-sm text-darkAlertOrange">{l.entity}</td>
                <td className="p-3 text-sm text-darkAccent">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-3 text-sm">
                  <div className="space-y-1">
                    {l.oldValue && (
                      <div>
                        <strong className="text-darkAlertRed">{t('audit.old')}:</strong>{' '}
                        <span className="text-xs opacity-75">{JSON.stringify(l.oldValue).substring(0, 80)}...</span>
                      </div>
                    )}
                    {l.newValue && (
                      <div>
                        <strong className="text-darkAlertGreen">{t('audit.new')}:</strong>{' '}
                        <span className="text-xs opacity-75">{JSON.stringify(l.newValue).substring(0, 80)}...</span>
                      </div>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {filteredData.map((l, i) => (
          <motion.div
            key={l.id}
            className="bg-darkCard rounded-lg p-4 border border-darkAccent/30"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex justify-between items-start gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-darkAccent mb-1">{l.userId}</div>
                <div className="font-semibold text-primary-300 text-sm">{l.action}</div>
              </div>
              <button
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
                className="p-1 hover:bg-darkAccent/20 rounded transition-colors"
              >
                <MoreVert fontSize="small" />
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="text-darkAccent">{t('audit.entity')}:</span>
                <span className="text-darkAlertOrange font-medium">{l.entity}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-darkAccent">{t('audit.timestamp')}:</span>
                <span className="text-xs opacity-75">{new Date(l.timestamp).toLocaleString()}</span>
              </div>
            </div>

            {expandedId === l.id && (
              <motion.div
                className="mt-3 pt-3 border-t border-darkAccent/30 space-y-2 text-xs"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                {l.oldValue && (
                  <div>
                    <strong className="text-darkAlertRed block mb-1">{t('audit.old')}:</strong>
                    <div className="bg-darkAccent/10 p-2 rounded break-words">{JSON.stringify(l.oldValue, null, 2).substring(0, 200)}</div>
                  </div>
                )}
                {l.newValue && (
                  <div>
                    <strong className="text-darkAlertGreen block mb-1">{t('audit.new')}:</strong>
                    <div className="bg-darkAccent/10 p-2 rounded break-words">{JSON.stringify(l.newValue, null, 2).substring(0, 200)}</div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-darkAccent">
          {t('loading')} or no logs found
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
