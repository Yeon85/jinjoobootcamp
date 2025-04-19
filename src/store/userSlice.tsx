import { createSlice } from '@reduxjs/toolkit';

interface UserState {
  id: number | null;
  name: string;
  email: string;
  profileImage: string;
  extraCompleted: boolean
  isLoggedIn: boolean;
}

const initialState: UserState = {
  id: null,
  name: '',
  email: '',
  profileImage: '',
  extraCompleted: false,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginUser: (state, action) => {
      const { id, name, email, profileImage, extraCompleted } = action.payload;
      state.id = id;
      state.name = name;
      state.email = email;
      state.profileImage = profileImage;
      state.extraCompleted = extraCompleted;
      state.isLoggedIn = true;
    },
    logoutUser: (state) => {
      state.id = null;
      state.name = '';
      state.email = '';
      state.profileImage = '';
      state.extraCompleted = false;
      state.isLoggedIn = false;
    },
  },
});

export const { loginUser, logoutUser } = userSlice.actions;
export default userSlice.reducer;