import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { DarkMode, LightMode } from '@mui/icons-material';


const Navigation: React.FC = () => {
  const { user, userData, logout } = useAuth();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [dark, setDark] = React.useState(true);

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [dark]);

  const isActive = (path: string) => location.pathname === path ? 'bg-primary-700' : '';

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <nav className="bg-darkCard text-darkText shadow-lg dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-400">DLM</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/" className={`px-3 py-2 rounded ${isActive('/')}`}>
            {t('dashboard.title')}
            </Link>
            <Link to="/dataloggers" className={`px-3 py-2 rounded ${isActive('/dataloggers')}`}>{t('dataloggers.title')}</Link>
            <Link to="/usage" className={`px-3 py-2 rounded ${isActive('/usage')}`}>{t('usage.title')}</Link>
            <Link to="/calibration" className={`px-3 py-2 rounded ${isActive('/calibration')}`}>{t('calibration.title')}</Link>
            <Link to="/audit" className={`px-3 py-2 rounded ${isActive('/audit')}`}>{t('audit.title')}</Link>
            {userData?.role === 'ADMIN' && (
              <Link to="/users" className={`px-3 py-2 rounded ${isActive('/users')}`}>{t('users.title')}</Link>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-2 rounded hover:bg-primary-700 transition-colors"
              title="Toggle language"
            >
              {i18n.language === 'fr' ? 'EN' : 'FR'}
            </button>
            <button
              onClick={() => setDark(d => !d)}
              className="px-3 py-2 rounded hover:bg-primary-700 transition-colors"
              title="Toggle dark mode"
            >
              {dark ? <DarkMode /> : <LightMode />}
            </button>
            {user ? (
              <>
                <span className="text-sm">{user.email}</span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded bg-red-500 hover:bg-red-600 transition-colors"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <Link to="/login" className="px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors">
                {t('login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
