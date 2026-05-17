import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { DarkMode, LightMode, Dashboard, Storage, TrendingUp, Build, Description, People, Logout as LogoutIcon,Login as LoginIcon } from '@mui/icons-material';
import { Tooltip } from '@mui/material';


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

  const NavLink = ({ to, label, icon: Icon }: { to: string; label: string; icon: any }) => (
    <Tooltip title={label} arrow>
      <Link
        to={to}
        className={` h-full px-1 sm:px-3 py-2 rounded flex items-center gap-1 md:gap-2 hover:bg-primary-600 transition-colors ${isActive(to)}`}
      >
        <Icon className="aspect-square h-full" />
        <span className="hidden md:inline text-xs">{label}</span>
      </Link>
    </Tooltip>
  );

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'fr' ? 'en' : 'fr');
  };

  return (
    <nav className="sticky top-0 bg-darkCard text-darkText shadow-lg dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-400">DLM</h1>
          </div>

          <div className="flex items-center  gap-5 md:gap-2">
            <NavLink to="/" label="Dashboard" icon={Dashboard} />
            <NavLink to="/dataloggers" label="Loggers" icon={Storage} />
            <NavLink to="/usage" label="Usage" icon={TrendingUp} />
            <NavLink to="/calibration" label="Calibration" icon={Build} />
            <NavLink to="/audit" label="Audit" icon={Description} />
            {userData?.role === 'ADMIN' && (
              <NavLink to="/users" label="Users" icon={People} />
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-2">
            <Tooltip title={i18n.language === 'fr' ? 'English' : 'Français'} arrow>
              <button
                onClick={toggleLanguage}
                className="gap-1 md:gap-2 py-2 rounded hover:bg-primary-700 transition-colors text-sm font-semibold"
                title="Toggle language"
              >
                {i18n.language === 'fr' ? 'EN' : 'FR'}
              </button>
            </Tooltip>
            <Tooltip title="Toggle dark mode" arrow>
              <button
                onClick={() => setDark(d => !d)}
                className="gap-1 md:gap-2 py-2 rounded hover:bg-primary-700 transition-colors"
                title="Toggle dark mode"
              >
                {dark ? <DarkMode className="w-5 h-5" /> : <LightMode className="w-5 h-5" />}
              </button>
            </Tooltip>
            {user ? (
              <>
                <span className="text-xs sm:text-sm hidden xs:inline">{user.displayName}</span>
                <Tooltip title={t('logout')} arrow>
                  <button
                    onClick={logout}
                    className="gap-1 md:gap-2 py-1 px-2 rounded bg-red-500 hover:bg-red-600 transition-colors flex items-center gap-2 px-2"
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span className="hidden md:inline text-sm">{t('logout')}</span>
                  </button>
                </Tooltip>
              </>
            ) : (
              <Link to="/login" className=" gap-1 md:gap-2 py-1 px-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors text-sm sm:text-base">
                <LoginIcon className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
