import {
  Action,
    combineReducers,
    configureStore,
    ThunkAction
  } from "@reduxjs/toolkit"
import counterSlice from "./slices/counterSlice"
import vaaSlice from "./slices/vaaSlice"




  
  const combineReducer = combineReducers({
    counter: counterSlice,
    vaa:vaaSlice,

    
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

  

  