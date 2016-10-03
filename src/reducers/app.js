import {fromJS} from 'immutable';
const initialState = fromJS({
  device: null
});

export default function(state = initialState, action) {
  switch (action.type) {
    case 'SET_DEVICE':
      return state.set('device', action.device);
    default:
      return state;
  }
}