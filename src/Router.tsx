/**
 * Router.tsx
 * Router hash-based leggero senza dipendenze esterne.
 * Gestisce navigazione tra Creator, Admin Login, Dashboard, Archivio e Dettaglio.
 */
import { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  path: '/',
  navigate: () => {},
  params: {},
});

export function useRouter() {
  return useContext(RouterContext);
}

function getHashPath(): string {
  const hash = window.location.hash.slice(1) || '/';
  return hash;
}

function extractParams(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params: Record<string, string> = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [path, setPath] = useState(getHashPath);

  useEffect(() => {
    const handler = () => setPath(getHashPath());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate, params: {} }}>
      {children}
    </RouterContext.Provider>
  );
}

interface RouteProps {
  pattern: string;
  component: React.ComponentType<{ params: Record<string, string> }>;
}

export function Routes({ routes }: { routes: RouteProps[] }) {
  const { path } = useRouter();

  for (const route of routes) {
    const params = extractParams(route.pattern, path);
    if (params !== null) {
      const Component = route.component;
      return <Component params={params} />;
    }
  }

  // Default: prima route
  if (routes.length > 0) {
    const Component = routes[0].component;
    return <Component params={{}} />;
  }

  return null;
}
