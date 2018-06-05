import axios from 'axios';
import jwt_decode from 'jwt-decode';
import setAuthToken from '../utils/setAuthToken';

import { GET_ERRORS, SET_CURRENT_USER } from "./types";

// Register User
export const registerUser= (userData, history) => dispatch => {
    axios.post('/api/users/register', userData)
        .then(res => history.push('/login'))
        .catch(err =>
            dispatch({
               type: GET_ERRORS,
               payload: err.response.data
            })
        );
};

export const loginUser = userData => dispatch => {
  axios.post('/api/users/login', userData)
      .then(res => {
        // Save to localStorage
          const { token } = res.data;
          // Set token to storage
          localStorage.setItem('jwtToke', token);
          // Set token to Auth header
          setAuthToken(token);
          // Decode toket to get user data
          const decoded = jwt_decode(token);
          // Set current user
          dispatch(setCurrentUser(decoded));
      })
      .catch(err =>
          dispatch({
              type: GET_ERRORS,
              payload: err.response.data
          })
      );
};

// Set logged in user
export const setCurrentUser = decoded => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded
    }
};

// Log user out
export const logoutUser = () => dispatch => {
  // Remove token from local storage
  localStorage.removeItem('jwtToken');
  // Remove auth header for future requests
    setAuthToken(false);
    // Set current user as empty which will set setAuthenticated to false
    dispatch(setCurrentUser({}));
};