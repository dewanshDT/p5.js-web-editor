import { useDispatch } from 'react-redux';
import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { getUser } from './modules/User/actions';
import { stopSketch } from './modules/IDE/actions/ide';
import {
  userIsAuthenticated,
  userIsAuthorized,
  userIsNotAuthenticated,
  UserIsAuthenticated,
  UserIsNotAuthenticated
} from './utils/auth';
import { mobileFirst, responsiveForm } from './utils/responsive';
import { ElementFromComponent } from './utils/router-compatibilty';

const RedirectToUser = React.lazy(() =>
  import('./components/createRedirectWithUsername')
);
const App = React.lazy(() => import('./modules/App/App'));
const IDEView = React.lazy(() => import('./modules/IDE/pages/IDEView'));
const MobileIDEView = React.lazy(() =>
  import('./modules/IDE/pages/MobileIDEView')
);
const MobileSketchView = React.lazy(() =>
  import('./modules/Mobile/MobileSketchView')
);
const MobilePreferences = React.lazy(() =>
  import('./modules/Mobile/MobilePreferences')
);
const FullView = React.lazy(() => import('./modules/IDE/pages/FullView'));
const LoginView = React.lazy(() => import('./modules/User/pages/LoginView'));
const SignupView = React.lazy(() => import('./modules/User/pages/SignupView'));
const ResetPasswordView = React.lazy(() =>
  import('./modules/User/pages/ResetPasswordView')
);
const EmailVerificationView = React.lazy(() =>
  import('./modules/User/pages/EmailVerificationView')
);
const NewPasswordView = React.lazy(() =>
  import('./modules/User/pages/NewPasswordView')
);
const AccountView = React.lazy(() =>
  import('./modules/User/pages/AccountView')
);
const CollectionView = React.lazy(() =>
  import('./modules/User/pages/CollectionView')
);
const DashboardView = React.lazy(() =>
  import('./modules/User/pages/DashboardView')
);
const MobileDashboardView = React.lazy(() =>
  import('./modules/Mobile/MobileDashboardView')
);
const Legal = React.lazy(() => import('./modules/IDE/pages/Legal'));

/**
 * Wrapper around App for handling legacy 'onChange' and 'onEnter' functionality,
 * injecting the location prop, and rendering child route content.
 */
const Main = () => {
  const location = useLocation();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, []);

  // TODO: This short-circuit seems unnecessary - using the mobile <Switch /> navigator (future) should prevent this from being called
  useEffect(() => {
    if (location.pathname.includes('preview')) return;

    dispatch(stopSketch());
  }, [location.pathname]);

  return (
    <App location={location}>
      <Outlet />
    </App>
  );
};

const routes = [
  {
    path: '/',
    element: <Main />,
    children: [
      {
        index: true,
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/login',
        element: (
          <ElementFromComponent
            component={userIsNotAuthenticated(
              mobileFirst(responsiveForm(LoginView), LoginView)
            )}
          />
        )
      },
      {
        path: '/signup',
        element: (
          <ElementFromComponent
            component={userIsNotAuthenticated(
              mobileFirst(responsiveForm(SignupView), SignupView)
            )}
          />
        )
      },
      {
        path: '/reset-password',
        element: (
          <UserIsNotAuthenticated>
            <ResetPasswordView />
          </UserIsNotAuthenticated>
        )
      },
      { path: '/verify', element: <EmailVerificationView /> },
      {
        path: '/reset-password/:reset_password_token',
        element: <NewPasswordView />
      },
      {
        path: '/projects/:project_id',
        element: <ElementFromComponent component={IDEView} />
      },
      { path: '/:username/full/:project_id', element: <FullView /> },
      { path: '/full/:project_id', element: <FullView /> },
      {
        path: '/:username/assets',
        element: (
          <ElementFromComponent
            component={userIsAuthenticated(
              userIsAuthorized(mobileFirst(MobileDashboardView, DashboardView))
            )}
          />
        )
      },
      {
        path: '/:username/sketches',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileDashboardView, DashboardView)}
          />
        )
      },
      {
        path: '/:username/sketches/:project_id',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/:username/sketches/:project_id/add-to-collection',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileIDEView, IDEView)}
          />
        )
      },
      {
        path: '/:username/collections',
        element: (
          <ElementFromComponent
            component={mobileFirst(MobileDashboardView, DashboardView)}
          />
        )
      },
      {
        path: '/:username/collections/:collection_id',
        element: <ElementFromComponent component={CollectionView} />
      },
      {
        path: '/sketches',
        element: <RedirectToUser url="/:username/sketches" />
      },
      {
        path: '/assets',
        element: <RedirectToUser url="/:username/assets" />
      },
      {
        path: '/account',
        element: (
          <UserIsAuthenticated>
            <AccountView />
          </UserIsAuthenticated>
        )
      },
      {
        path: '/about',
        element: <ElementFromComponent component={IDEView} />
      },
      /* Mobile-only Routes */
      { path: '/preview', element: <MobileSketchView /> },
      { path: '/preferences', element: <MobilePreferences /> },
      { path: '/privacy-policy', element: <Legal /> },
      { path: '/terms-of-use', element: <Legal /> },
      {
        path: '/code-of-conduct',
        element: <Legal />
      }
    ]
  }
];

export default routes;
