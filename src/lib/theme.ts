export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'folio-theme';

// Runs in the head before the first paint, without waiting for React hydration.
export const themeBootstrap = `(()=>{let theme='light';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='dark')theme='dark'}catch{}document.documentElement.dataset.theme=theme})();`;
