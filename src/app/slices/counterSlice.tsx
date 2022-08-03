import { createSlice, PayloadAction} from "@reduxjs/toolkit"
// import type { RootState } from "app/store";

//declare types for state
interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

export const counterSlice = createSlice({
  name: "counter",
  initialState,
  reducers: {
    increment: (state) => {
      state.value++
    },
    decrement: (state) => {
      state.value--
    },
    incrementByAmount: (
      state,
      action: PayloadAction<typeof initialState.value>
    ) => {
      state.value += action.payload
    }
  }

})

//helper function
// export const getCounterState = (state: { counter: CounterState }) =>
//   state.counter;
// export const getCount = (state: RootState) => state.counter.value;

export const { increment, decrement, incrementByAmount } =
  counterSlice.actions

export default counterSlice.reducer
