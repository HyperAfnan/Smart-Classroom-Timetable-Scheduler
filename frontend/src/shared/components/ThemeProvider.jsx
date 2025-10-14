import { useDispatch, useSelector } from 'react-redux';
import {
  hydrateTheme,
  selectThemeMode,
  selectResolvedTheme,
  setResolvedMode,
} from '@/Store/theme';
import { useEffect } from "react";

const STORAGE_KEY = 'theme:mode';

function computeResolved(mode, prefersDark) {
  if (mode === 'dark') return 'dark';
  if (mode === 'light') return 'light';
  return prefersDark ? 'dark' : 'light';
}

export default function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const mode = useSelector(selectThemeMode);
  const resolvedMode = useSelector(selectResolvedTheme);

  useEffect(() => {
    const savedMode =
      typeof window !== 'undefined'
        ? window.localStorage.getItem(STORAGE_KEY)
        : null;

    const mql =
      typeof window !== 'undefined'
        ? window.matchMedia('(prefers-color-scheme: dark)')
        : { matches: false };

    const initialMode = savedMode || 'system';
    const initialResolved = computeResolved(initialMode, mql.matches);

    dispatch(
      hydrateTheme({
        mode: initialMode,
        resolvedMode: initialResolved,
      })
    );
  }, [dispatch]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      if (mode === 'system') {
        dispatch(setResolvedMode(e.matches ? 'dark' : 'light'));
      }
    };

    mql.addEventListener?.('change', handler);
    return () => {
      mql.removeEventListener?.('change', handler);
    };
  }, [dispatch, mode]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [resolvedMode]);

  return children;
}
