import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import LoginForm from '../components/LoginForm';
import SocialAuthButton from '../components/SocialAuthButton';
import RootPage from '../../../components/RootPage';
import NavV2 from '../../IDE/components/Header/NavV2';

function LoginView() {
  const { t } = useTranslation();
  return (
    <RootPage>
      <NavV2 layout="dashboard" />
      <main className="form-container">
        <Helmet>
          <title>{t('LoginView.Title')}</title>
        </Helmet>
        <div className="form-container__content">
          <h2 className="form-container__title">{t('LoginView.Login')}</h2>
          <LoginForm />
          <h2 className="form-container__divider">{t('LoginView.LoginOr')}</h2>
          <div className="form-container__stack">
            <SocialAuthButton service={SocialAuthButton.services.github} />
            <SocialAuthButton service={SocialAuthButton.services.google} />
          </div>
          <p className="form__navigation-options">
            {t('LoginView.DontHaveAccount')}
            <Link className="form__signup-button" to="/signup">
              {t('LoginView.SignUp')}
            </Link>
          </p>
          <p className="form__navigation-options">
            {t('LoginView.ForgotPassword')}
            <Link className="form__reset-password-button" to="/reset-password">
              {' '}
              {t('LoginView.ResetPassword')}
            </Link>
          </p>
        </div>
      </main>
    </RootPage>
  );
}

export default LoginView;
