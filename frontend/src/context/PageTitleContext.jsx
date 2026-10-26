import { createContext, useContext, useState, useEffect } from 'react';

const PageTitleContext = createContext(null);

export function PageTitleProvider({ children }) {
  const [title, setTitle] = useState('Dashboard');
  return <PageTitleContext.Provider value={{ title, setTitle }}>{children}</PageTitleContext.Provider>;
}

export function usePageTitleContext() {
  const ctx = useContext(PageTitleContext);
  if (!ctx) throw new Error('usePageTitleContext must be used within PageTitleProvider');
  return ctx;
}

// Convenience hook individual pages call to set the topbar title on mount
export function usePageTitle(title) {
  const { setTitle } = usePageTitleContext();
  useEffect(() => {
    setTitle(title);
  }, [title]);
}
