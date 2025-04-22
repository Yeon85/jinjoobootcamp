import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id: number | null;
  name: string;
  email: string;
  profileImage: string;
  extraCompleted: boolean;
  isLoggedIn: boolean;
  job_title?: string;
  birthday?: string;
  location?: string;
  phone?: string;
  twitter_url?: string;
  dribbble_url?: string;
  github_url?: string;
  role_code?: string;
}

const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  profileImage: '',
  extraCompleted: false,
  isLoggedIn: false,

  // 추가 필드 초기값
  job_title: '',
  birthday: '',
  location: '',
  phone: '',
  twitter_url: '',
  dribbble_url: '',
  github_url: '',
  role_code:'',
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
      loginUser: (state, action: PayloadAction<UserState>) => {
          const {
              id,
              name,
              email,
              profileImage,
              extraCompleted,
              job_title,
              birthday,
              location,
              phone,
              twitter_url,
              dribbble_url,
              github_url,
              role_code,
          } = action.payload;

          state.id = id;
          state.name = name;
          state.email = email;
          state.profileImage = profileImage;
          state.extraCompleted = extraCompleted;
          state.isLoggedIn = true;

          // 🔥 추가 필드 저장
          state.job_title = job_title || '';
          state.birthday = birthday || '';
          state.location = location || '';
          state.phone = phone || '';
          state.twitter_url = twitter_url || '';
          state.dribbble_url = dribbble_url || '';
          state.github_url = github_url || '';
          state.role_code = role_code || '';
      },

      updateUser: (state, action: PayloadAction<Partial<UserState>>) => {
          // 업데이트할 필드만 선택적으로 덮어쓰기
          Object.assign(state, action.payload);
      },

      logoutUser: (state) => {
          Object.assign(state, initialState);
      }
  },
});

export const { loginUser, updateUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;
