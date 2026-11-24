import { logoutUser } from '@/services/slices/userSlice';
import { useDispatch } from '@/services/store';
import { ProfileMenuUI } from '@ui';
import { useLocation, useNavigate } from 'react-router-dom';

export const ProfileMenu = (): React.JSX.Element => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = (): void => {
    void dispatch(logoutUser())
      .unwrap()
      .then(() => {
        void navigate('/login');
      })
      .catch((error) => {
        console.error('Ошибка при выходе:', error);
      });
  };

  return <ProfileMenuUI handleLogout={handleLogout} pathname={pathname} />;
};
