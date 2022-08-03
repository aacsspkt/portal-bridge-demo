import {
  Action,
    combineReducers,
    configureStore,
    ThunkAction
  } from "@reduxjs/toolkit"
import counterSlice from "./slices/counterSlice"
import transferSlice from "./slices/transferSlice"



  
  const combineReducer = combineReducers({
    counter: counterSlice,
    transfer:transferSlice,

    
  })
  
  export const store = configureStore({
    reducer: combineReducer,
    
  })
  
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>

  

  