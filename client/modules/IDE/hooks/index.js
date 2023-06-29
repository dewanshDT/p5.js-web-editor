import { useDispatch, useSelector } from 'react-redux';
import { newProject, saveProject } from '../actions/project';
import { useTranslation } from 'react-i18next';
import { showToast } from '../actions/toast';
import { showErrorModal } from '../actions/ide';

export const useSketchActions = () => {
  const unsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const authenticated = useSelector((state) => state.user.authenticated);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  function newSketch() {
    if (!unsavedChanges) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    } else if (window.confirm(t('Nav.WarningUnsavedChanges'))) {
      dispatch(showToast('Toast.OpenedNewSketch'));
      dispatch(newProject());
    }
  }

  function saveSketch(cmController) {
    if (authenticated) {
      dispatch(saveProject(cmController?.getContent()));
    } else {
      dispatch(showErrorModal('forceAuthentication'));
    }
  }

  return { newSketch, saveSketch };
};
