// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import themeConfigReducer from './themeConfigSlice';
import userReducer from './userSlice'; // 추가한 사용자 Slice

export const store = configureStore({
    reducer: {
        user: userReducer,
        themeConfig: themeConfigReducer,
    },
});

export type IRootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
