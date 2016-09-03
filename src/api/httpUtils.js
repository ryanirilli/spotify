export function addAuthTokenToHeaders(options = {}) {
  options.headers = options.headers || {};
  const token = getLocalStorageItem('userAccessToken') || getLocalStorageItem('accessToken');
  options.headers.authorization = `Bearer ${token}`;
  return options;
}

export function setLocalStorageItem(key, val) {
  localStorage.setItem(key, val);
}

export function getLocalStorageItem(key) {
  return localStorage.getItem(key);
}

export function deleteLocalStorageItem(key) {
  localStorage.removeItem(key);
}

export function request(url, opts) {
  const options = Object.assign(addAuthTokenToHeaders(), opts);
  return new Promise((resolve, reject) => {
    fetch(url, options)
      .then(res => {
        if (res.status === 200) {
          return res.json().then(json => resolve({json, res}));
        }

        if (res.status < 300) {
          return resolve();
        }

        if (res.status === 500) {
          return reject();
        }

        if (res.status > 400) {
          return res.json()
            .then(json => reject({errors: json.errors, res}));
        }
      });
  });
}