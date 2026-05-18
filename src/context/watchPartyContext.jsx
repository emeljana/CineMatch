/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';

const WatchPartyContext = createContext(null);

export function WatchPartyProvider({ children }) {
  const [watchParty, setWatchParty] = useState(null);

  return (
    <WatchPartyContext.Provider value={{ watchParty, setWatchParty }}>
      {children}
    </WatchPartyContext.Provider>
  );
}

export function useWatchParty() {
  return useContext(WatchPartyContext);
}
