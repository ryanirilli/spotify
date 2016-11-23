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
            .then(json => {
              if (json.error.status === 401) {
                // const refresh_token = getLocalStorageItem('userRefresh');
                // if (refresh_token) {
                //   const params = {
                //     method: 'post',
                //     grant_type: 'refresh_token',
                //     mode: 'no-cors',
                //     refresh_token
                //   };
                //   fetch('https://accounts.spotify.com/api/token', params)
                //     .then(res => res.json())
                //     .then(json => {
                //       debugger;
                //     }).catch(json => {
                //       deleteLocalStorageItem('accessToken');
                //       deleteLocalStorageItem('userAccessToken');
                //       deleteLocalStorageItem('userRefresh');
                //       window.location.reload();
                //     });
                // }
              }

              return reject({errors: json.errors, res})
            });
        }
      });
  });
}