export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'folio-theme';

// Runs in the head before the first paint, without waiting for React hydration.
export const themeBootstrap = `(()=>{let theme='dark';try{if(localStorage.getItem('${THEME_STORAGE_KEY}')==='light')theme='light'}catch{}document.documentElement.dataset.theme=theme})();`;
