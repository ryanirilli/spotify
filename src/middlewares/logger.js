const syncActionLabel = 'color:#333; background:rgba(0,0,0,0.05);';
const asyncActionLabel = 'color:white; background:#3498DB;';
const labelFormat = "font-size: 9pt; padding:5px 40px; line-height: 4; border-radius: 100px;";

export default store => next => action => {

  if(typeof action === 'function') {

    console.log('%cAsync Action', `${asyncActionLabel}${labelFormat}`);

    console.groupCollapsed('Action');
    console.log(action);
    console.groupEnd();

    return next(action);
  }

  const state = store.getState();
  const formattedState = {};
  Object.keys(state).forEach(key => {
    const val = state[key];
    formattedState[key] = val.toJSON ? val.toJSON() : val;
  });

  console.log(`%c${action.type}`, `${syncActionLabel}${labelFormat}`);

  console.groupCollapsed('Current State');
  console.log(formattedState);
  console.groupEnd();

  console.group('Action');
  console.log(action);
  console.groupEnd();

  return next(action);
}
