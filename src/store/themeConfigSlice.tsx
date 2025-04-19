// src/store/themeConfigSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';
import themeConfig from '../theme.config';

const initialState = {
    theme: localStorage.getItem('theme') || themeConfig.theme,
    menu: localStorage.getItem('menu') || themeConfig.menu,
    layout: localStorage.getItem('layout') || themeConfig.layout,
    rtlClass: localStorage.getItem('rtlClass') || themeConfig.rtlClass,
    animation: localStorage.getItem('animation') || themeConfig.animation,
    navbar: localStorage.getItem('navbar') || themeConfig.navbar,
    locale: localStorage.getItem('i18nextLng') || themeConfig.locale,
    isDarkMode: false,
    sidebar: localStorage.getItem('sidebar') === 'true',
    semidark: localStorage.getItem('semidark') === 'true',
    languageList: [
        { code: 'ko', name: '🇰🇷 Korea' },
        { code: 'zh', name: 'Chinese' },
        { code: 'en', name: 'English' },
        { code: 'ja', name: 'Japanese' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'ru', name: 'Russian' },
        { code: 'es', name: 'Spanish' },
        { code: 'tr', name: 'Turkish' },
    ],
};

const themeConfigSlice = createSlice({
    name: 'themeConfig',
    initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme;
            localStorage.setItem('theme', payload);
            state.theme = payload;
            state.isDarkMode = payload === 'dark' || (payload === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.body.classList.toggle('dark', state.isDarkMode);
        },
        toggleMenu(state, { payload }) {
            state.menu = payload || state.menu;
            localStorage.setItem('menu', state.menu);
            state.sidebar = false;
        },
        toggleLayout(state, { payload }) {
            state.layout = payload || state.layout;
            localStorage.setItem('layout', state.layout);
        },
        toggleRTL(state, { payload }) {
            state.rtlClass = payload || state.rtlClass;
            localStorage.setItem('rtlClass', state.rtlClass);
            document.documentElement.setAttribute('dir', state.rtlClass);
        },
        toggleAnimation(state, { payload }) {
            state.animation = payload?.trim() || state.animation;
            localStorage.setItem('animation', state.animation);
        },
        toggleNavbar(state, { payload }) {
            state.navbar = payload || state.navbar;
            localStorage.setItem('navbar', state.navbar);
        },
        toggleSemidark(state, { payload }) {
            state.semidark = payload === true || payload === 'true';
            localStorage.setItem('semidark', String(state.semidark));
        },
        toggleLocale(state, { payload }) {
            state.locale = payload || state.locale;
            i18next.changeLanguage(state.locale);
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },
        setPageTitle(state, { payload }) {
            document.title = `${payload} || 정연주 부트캠프`;
        },
    },
});

export const {
    toggleTheme,
    toggleMenu,
    toggleLayout,
    toggleRTL,
    toggleAnimation,
    toggleNavbar,
    toggleSemidark,
    toggleLocale,
    toggleSidebar,
    setPageTitle,
} = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
