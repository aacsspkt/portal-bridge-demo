import { createSlice, PayloadAction} from "@reduxjs/toolkit"
// import type { RootState } from "app/store";

//declare types for state
interface vaaState {
    vaaValue: string
}

const initialState: vaaState = {
  vaaValue: ""
}

export const vaaSlice = createSlice({
  name: "vaa",
  initialState,
  reducers: {
    setVaa: (state,action) => {
      state.vaaValue= action.payload
    }
  }

})


export const { setVaa } =
  vaaSlice.actions

export default vaaSlice.reducer
