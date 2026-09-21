import { useMemo } from 'react';

import { isCeoPhone } from '../../const/role/role';
import { useAppSelector } from '../redux/redux';

/**
 * Kya logged-in user CEO hai?
 *
 * CEO ke paas view/report sab kuch hota hai par booking banane ya usme
 * change karne ke actions nahi — isliye screens isi hook se wo actions
 * chhupa deti hain (`MainStack` ke CEO tabs bhi isi whitelist par tike hain).
 */
const useIsCeo = (): boolean => {
  const user = useAppSelector((state) => state.user.user);

  return useMemo(() => isCeoPhone(user?.phone), [user?.phone]);
};

export default useIsCeo;
