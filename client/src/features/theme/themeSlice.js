import { createSlice } from "@reduxjs/toolkit";

const initial = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-bs-theme", initial);

const apply = (mode) => {
  localStorage.setItem("theme", mode);
  document.documentElement.setAttribute("data-bs-theme", mode);
};

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: initial },
  reducers: {
    toggleTheme(state) {
      state.mode = state.mode === "light" ? "dark" : "light";
      apply(state.mode);
    },
    setTheme(state, action) {
      state.mode = action.payload;
      apply(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
