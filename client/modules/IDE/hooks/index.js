import { useDispatch, useSelector } from 'react-redux';
import {
  autosaveProject,
  exportProjectAsZip,
  newProject,
  saveProject
} from '../actions/project';
import { useTranslation } from 'react-i18next';
import { showToast } from '../actions/toast';
import { showErrorModal, showShareModal } from '../actions/ide';
import { useParams } from 'react-router';

export const useSketchActions = () => {
  const unsavedChanges = useSelector((state) => state.ide.unsavedChanges);
  const authenticated = useSelector((state) => state.user.authenticated);
  const project = useSelector((state) => state.project);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const params = useParams();

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

  function downloadSketch() {
    dispatch(autosaveProject());
    dispatch(exportProjectAsZip(project.id));
  }

  function shareSketch() {
    const { username } = params;
    dispatch(showShareModal(project.id, project.name, username));
  }

  return { newSketch, saveSketch, downloadSketch, shareSketch };
};
