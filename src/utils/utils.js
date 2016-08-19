/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds.
 * @method debounce
 * @param {Function} func to be called after debounce period
 * @param {Number} wait time to wait before calling the function
 * */
export function debounce(func, wait) {
  let timeout;
  return function() {
    const later = () => {
      timeout = null;
      func.apply(this, arguments);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }
}

export function generateGuid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
  }
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
}