import { useMemo } from 'react';

import { isCeoUser } from '../../const/role/role';
import { useAppSelector } from '../redux/redux';

/**
 * Kya logged-in user CEO hai?
 *
 * CEO ke paas view/report sab kuch hota hai par booking banane ya usme
 * change karne ke actions nahi — isliye screens isi hook se wo actions
 * chhupa deti hain (`MainStack` ke CEO tabs bhi isi par tike hain).
 *
 * Role backend ki access list se aata hai (`user.accessRole`).
 */
const useIsCeo = (): boolean => {
  const user = useAppSelector((state) => state.user.user);

  return useMemo(() => isCeoUser(user), [user]);
};

export default useIsCeo;
