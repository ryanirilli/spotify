import { fromJS } from 'immutable';

const initialState = fromJS({
  sampleProperty: 'sample value'
});

export default function(state = initialState, action = {}) {
  switch (action.type) {
    case 'UPDATE_SAMPLE_PROPERTY': {
      return state.set('sampleProperty', action.sampleProperty)
    }
    default:
      return state;
  }
};