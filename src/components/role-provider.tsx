'use client';

import React, { createContext, useContext, useState } from 'react';
import { useIsMounted } from '@/lib/hooks/use-is-mounted';

export type Role = 'admin' | 'client';
const RoleContext = createContext<{ role: Role; setRole: (r: Role) => void }>({
  role: 'client',
  setRole: () => {},
});
export function useRole() {
  return useContext(RoleContext);
}

export default function RoleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [role, setRole] = useState<Role>('client');
  const isMounted = useIsMounted();

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {isMounted && (
        <div style={{ position: 'fixed', top: 10, right: 32, zIndex: 9999 }}>
          {/* DEV ONLY: REMOVE FOR PRODUCTION */}
        </div>
      )}
      {children}
    </RoleContext.Provider>
  );
}
