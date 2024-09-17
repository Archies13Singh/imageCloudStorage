import { createStore, applyMiddleware } from 'redux';
import {thunk} from 'redux-thunk'; // Ensure correct import
import themeReducer from './reducer'; // Ensure path is correct

const store = createStore(
  themeReducer,
  applyMiddleware(thunk) // Apply thunk middleware
);

export default store;
