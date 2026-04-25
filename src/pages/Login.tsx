import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      // Look up email by username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', data.username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('username', { message: t('login.usernameNotFound') });
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // Use the email for Firebase Auth
      await login(userData.email, data.password);
      navigate('/');
    } catch (error: any) {
      setError('username', { message: error.message });
    }
  };

  return (
    <div className="p-6 bg-darkBg text-darkText min-h-screen dark transition-colors duration-300">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('login.title')}</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.username')}</label>
          <input
            type="text"
            {...register('username', { required: t('login.required') })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="username"
          />
          {errors.username && <span className="text-red-500 text-sm mt-1">{errors.username.message}</span>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password')}</label>
          <input
            type="password"
            {...register('password', { required: t('login.required') })}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.password && <span className="text-red-500 text-sm mt-1">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
        >
          {t('login.submit')}
        </button>
      </form>
    </div>
  );
};

export default Login;
