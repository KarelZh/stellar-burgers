import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
} from '@krgaa/react-developer-burger-ui-components';
import { NavLink } from 'react-router-dom';

import styles from './app-header.module.css';

type TIconType = 'primary' | 'secondary';

type AppHeaderUIProps = {
  userName?: string;
  currentPath: string;
};

const getIconType = (isActive: boolean): TIconType =>
  isActive ? 'primary' : 'secondary';

const getLinkClass = ({ isActive }: { isActive: boolean }): string =>
  isActive ? `${styles.link} ${styles.link_active}` : styles.link;

export const AppHeaderUI = ({
  userName,
  currentPath,
}: AppHeaderUIProps): React.JSX.Element => {
  const isProfileActive = (isActive: boolean): boolean => {
    if (isActive) return true;

    const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (!userName && currentPath && authRoutes.includes(currentPath)) {
      return true;
    }

    return false;
  };

  return (
    <header className={styles.header}>
      <nav className={`${styles.menu} p-4`}>
        <div className={styles.menu_part_left}>
          <NavLink to="/" className={getLinkClass}>
            {({ isActive }) => (
              <>
                <BurgerIcon type={getIconType(isActive)} />
                <p className="text text_type_main-default ml-2 mr-10">Конструктор</p>
              </>
            )}
          </NavLink>

          <NavLink to="/feed" className={getLinkClass}>
            {({ isActive }) => (
              <>
                <ListIcon type={getIconType(isActive)} />
                <p className="text text_type_main-default ml-2">Лента заказов</p>
              </>
            )}
          </NavLink>
        </div>
        <div className={styles.logo}>
          <Logo className="" />
        </div>
        <div className={styles.link_position_last}>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              getLinkClass({ isActive: isProfileActive(isActive) })
            }
          >
            {({ isActive }) => (
              <>
                <ProfileIcon type={getIconType(isProfileActive(isActive))} />
                <p className="text text_type_main-default ml-2">
                  {userName ?? 'Личный кабинет'}
                </p>
              </>
            )}
          </NavLink>
        </div>
      </nav>
    </header>
  );
};
