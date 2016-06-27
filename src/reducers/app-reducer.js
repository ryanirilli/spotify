import { fromJS } from 'immutable';

const initialState = fromJS({
  // put your default state here
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    default:
      return state;
  }
};