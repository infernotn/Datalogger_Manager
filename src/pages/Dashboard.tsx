import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Datalogger, Usage } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Dashboard as DashboardIcon, Sensors, Assignment, WarningAmber, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { userData } = useAuth();
  const [dataloggers, setDataloggers] = useState<Datalogger[]>([]);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        const dataloggersSnap = await getDocs(collection(db, 'dataloggers'));
        const usagesSnap = await getDocs(collection(db, 'usages'));
        setDataloggers(dataloggersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Datalogger)));
        setUsages(usagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Usage)));
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load dashboard data');
        setDataloggers([]);
        setUsages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalDataloggers = dataloggers.length;
  const activeUsages = usages.filter(u => !u.endDate).length;
  const availableDataloggers = dataloggers.filter(d => d.status === 'AVAILABLE').length;
  const inUseDataloggers = dataloggers.filter(d => d.status === 'IN_USE').length;

  const getCalibrationAlerts = () => {
    const now = new Date();
    return dataloggers.map(d => {
      const nextCal = new Date(d.nextCalibrationDate);
      const daysDiff = (nextCal.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (daysDiff < 0) return { ...d, alert: 'OVERDUE', color: 'red' };
      if (daysDiff < 30) return { ...d, alert: 'DUE_SOON', color: 'orange' };
      return { ...d, alert: 'OK', color: 'green' };
    });
  };

  const alerts = getCalibrationAlerts();
  const overdueCount = alerts.filter(a => a.alert === 'OVERDUE').length;
  const dueSoonCount = alerts.filter(a => a.alert === 'DUE_SOON').length;

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1 } }),
  };

  const alertVariants = {
    hidden: { opacity: 0, x: 40 },
    visible: (i: number) => ({ opacity: 1, x: 0, transition: { delay: i * 0.1 } }),
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;

  if (error) {
    return (
      <div className="p-6 min-h-screen bg-darkBg text-darkText dark">
        <motion.div
          className="bg-darkAlertRed/20 border border-darkAlertRed rounded-lg p-6 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <ErrorIcon className="text-darkAlertRed" />
            <div>
              <h2 className="text-lg font-bold text-darkAlertRed mb-1">Failed to Load Dashboard</h2>
              <p className="text-darkAlertRed/80">{error}</p>
              <p className="text-sm text-darkAccent mt-2">Please check your Firestore security rules or try refreshing the page.</p>
            </div>
          </div>
        </motion.div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-darkBg text-darkText dark">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2 text-primary-300">
          <DashboardIcon fontSize="large" /> {t('dashboard.title')}
        </h1>
        {userData && <p className="text-darkAccent">{t('user.welcome')}, {userData.email}</p>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[{
          icon: <Sensors fontSize="large" />, label: t('dashboard.totalDataloggers'), value: totalDataloggers, color: 'primary-400'
        }, {
          icon: <CheckCircle fontSize="large" />, label: t('dashboard.availableDataloggers'), value: availableDataloggers, color: 'darkAlertGreen'
        }, {
          icon: <Assignment fontSize="large" />, label: t('dashboard.inUseDataloggers'), value: inUseDataloggers, color: 'darkAlertOrange'
        }, {
          icon: <WarningAmber fontSize="large" />, label: t('dashboard.activeUsages'), value: activeUsages, color: 'darkAccent'
        }].map((card, i) => (
          <motion.div
            key={card.label}
            className={`bg-darkCard p-6 rounded-lg shadow-lg flex flex-col items-center justify-center`}
            style={{ color: `var(--tw-${card.color})` }}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={i}
          >
            <div className="mb-2">{card.icon}</div>
            <h2 className="text-sm mb-2">{card.label}</h2>
            <p className="text-3xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div className="bg-darkCard p-6 rounded-lg shadow" initial="hidden" animate="visible" variants={cardVariants} custom={0}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-200">
            <WarningAmber /> {t('dashboard.calibrationAlerts')}
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between p-2 rounded bg-darkAlertRed/10">
              <span className="flex items-center gap-1"><ErrorIcon className="text-darkAlertRed" />{t('calibration.OVERDUE')}</span>
              <span className="font-bold text-darkAlertRed">{overdueCount}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-darkAlertOrange/10">
              <span className="flex items-center gap-1"><WarningAmber className="text-darkAlertOrange" />{t('calibration.DUE_SOON')}</span>
              <span className="font-bold text-darkAlertOrange">{dueSoonCount}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-darkAlertGreen/10">
              <span className="flex items-center gap-1"><CheckCircle className="text-darkAlertGreen" />{t('calibration.OK')}</span>
              <span className="font-bold text-darkAlertGreen">{alerts.filter(a => a.alert === 'OK').length}</span>
            </div>
          </div>
        </motion.div>

        <motion.div className="bg-darkCard p-6 rounded-lg shadow" initial="hidden" animate="visible" variants={cardVariants} custom={1}>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary-200">
            <Assignment /> {t('dashboard.recentAlerts')}
          </h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {alerts.filter(a => a.alert !== 'OK').slice(0, 5).map((d, i) => (
              <motion.li
                key={d.id}
                className={`p-2 rounded text-sm flex items-center gap-2 ${d.color === 'red' ? 'bg-darkAlertRed/20 text-darkAlertRed' : 'bg-darkAlertOrange/20 text-darkAlertOrange'}`}
                variants={alertVariants}
                initial="hidden"
                animate="visible"
                custom={i}
              >
                {d.color === 'red' ? <ErrorIcon /> : <WarningAmber />}
                <strong>{d.name}</strong> - {t(`calibration.${d.alert}`)}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
