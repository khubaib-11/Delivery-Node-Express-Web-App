/* eslint-disable  */

// const { default: axios } = require('axios');
// import {default axios} from './axios';

// DOM
const loginForm = document.querySelector('.login__form');
const signupForm = document.querySelector('.signup__form');
const editProfileDataForm = document.querySelector('.editProfileData__form');
const editProfilePasswordForm = document.querySelector(
  '.editProfilePassword__form'
);
const editProfileBtn = document.querySelector('.btn-edit-profile');
const logoutBtn = document.querySelector('.btn__logout');
const orderForm = document.querySelector('.order__form');
const uploadOrderBtn = document.querySelector('.upload__order--btn');
const orderBtn = document.querySelector('.send__order--btn');
const map = document.getElementById('map');
const addLocationBtn = document.querySelector('.add__location');
const body = document.querySelector('body');

console.log('Hello');
console.log('Khubaib');

// ===============
// Functions
// ===============

// ===============
// Alerts
// ===============

const hideAlert = function () {
  const el = document.querySelector('.alert');
  if (el) el.parentElement.removeChild(el);
};

const showAlert = function (type, msg) {
  hideAlert();
  const markup = `<div class="alert alert--${type}">
  ${msg}
  </div>`;
  body.insertAdjacentHTML('afterbegin', markup);
  window.setTimeout(hideAlert, 4000);
};

// Redirect to different Page
const redirectTo = function (path, delay) {
  window.setTimeout(() => {
    location.assign(path);
  }, delay);
  console.log(path);
};

// ===============
// Login
// ===============

const login = async function (email, password) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      // alert('Logged In Successfully.');
      showAlert('success', 'Logged in Successfully');
      redirectTo('/', 2500);
    }
  } catch (error) {
    // alert(error.response.data.message);
    showAlert('fail', error.response.data.message);
  }
};

// ===============
// Logout
// ===============

const logout = async function () {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) {
      location.reload(true);
    }
  } catch (error) {
    console.log(error.response.data.message);
    showAlert('fail', 'Error occurred while logging out');
  }
};

// ===============
// Signup
// ===============

const signup = async function (name, email, password, passwordConfirm) {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account Created Successfully');
      redirectTo('/location', 2500);
    }
  } catch (error) {
    showAlert('fail', error.response.data);
  }
};

// ===============
// Edit Settings
// ===============

const updateSettings = async function (data, type) {
  console.log(...data);

  const url =
    type === 'password'
      ? 'http://127.0.0.1:3000/api/v1/users/updatePassword'
      : 'http://127.0.0.1:3000/api/v1/users/updateMe';

  try {
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        'success',
        `USER ${type} updated successfully. Reload page to see changes.`
      );
      // location.reload();

      // redirectTo('/', 2500);
    }
  } catch (error) {
    showAlert('fail', error.response.data.message);
  }
};

// ===============
// Add User Location
// ===============
const addUserLocation = async function (coords) {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/addLocation',
      data: {
        firstLocation: coords,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', `Your address is added successfully.`);
    }
  } catch (error) {
    showAlert('fail', error.message);
    console.log(error);
  }
};
const addUserLocationFinal = async function (coords) {
  try {
    const res = await axios({
      method: 'PATCH',
      url: 'http://127.0.0.1:3000/api/v1/users/addLocation',
      data: {
        secondLocation: coords,
      },
    });
    console.log(res);
    if (res.data.status === 'success') {
      showAlert('success', `Your address is added successfully.`);
    }
  } catch (error) {
    showAlert('fail', error.message);
    console.log(error);
  }
};

// ===============
// Send Order
// ===============
const sendOrder = async function (data) {
  // console.log(...data);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/orders',
      data,
    });

    if (res.data.status === 'success') {
      showAlert('success', `Order received. We will deliver it soon.`);
      // redirectTo('/', 2500);
    }
  } catch (error) {
    showAlert('fail', error.response.data.message);
  }
};

// Calling functions

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    signup(name, email, password, passwordConfirm);
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

if (editProfileDataForm) {
  editProfileDataForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const form = new FormData();

    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    console.log(...form);
    updateSettings(form, 'data');
  });
}

if (editProfilePasswordForm) {
  editProfilePasswordForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    console.log('Change Password');
    updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
  });
}

if (orderForm) {
  // orderForm.addEventListener('submit', function () {
  //   uploadOrderBtn.classList.add('hidden');
  // });

  uploadOrderBtn.addEventListener('click', function () {
    uploadOrderBtn.classList.add('hidden');
    orderBtn.classList.remove('hidden');
  });

  orderBtn.addEventListener('click', function (e) {
    e.preventDefault();
    const form = new FormData();

    // const order = document.getElementById('order').files[0];
    form.append('order', document.getElementById('order').files[0]);
    console.log(...form);
    sendOrder(form);
  });
}

// MapBox & Location finding
// if (map) {
//   navigator.geolocation.getCurrentPosition(
//     function (pos) {
//       const position = pos;
//       const { longitude, latitude } = position.coords;
//       console.log(position.coords);
//     },
//     function (error) {
//       // console.log(error);
//       showAlert('fail', error.message);
//     }
//   );
// }

// MapBox

if (map) {
  const mapBoxToken =
    'pk.eyJ1Ijoia2h1YmFpYi0xMSIsImEiOiJjbDg2cjZ4eXoxMjJwM3VsaDFxbDF1bG44In0.YMCOcBUXgLK4LK7XW1fc6w';

  const map = new mapboxgl.Map({
    accessToken: mapBoxToken,
    container: 'map',
    // style: 'mapbox://styles/khubaib-11/cl86ztlx9000y14lhoazljy9d',
    style: 'mapbox://styles/mapbox/satellite-streets-v11',
    center: [73.651361, 33.314352],
    zoom: 15,
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');

  const marker = new mapboxgl.Marker({
    color: '#FA7070',
    draggable: true,
    scale: 1,
    anchor: 'bottom',
  });

  const geoLocate = new mapboxgl.GeolocateControl({
    positionOptions: {
      enableHighAccuracy: true,
    },
    // trackUserLocation: true,
    showUserLocation: true,
  });
  map.addControl(geoLocate);

  let latitude, longitude;

  geoLocate.on('geolocate', (position) => {
    // console.log(position);
    lng = position.coords.longitude;
    lat = position.coords.latitude;

    // console.log(longitude, latitude);

    marker.setLngLat([lng, lat]);
    marker.setPopup(new mapboxgl.Popup().setHTML('<p>This is my Address.</p>'));
    marker.addTo(map);

    addUserLocation([lng, lat]);
    //
  });

  let lng, lat;

  marker.on('dragend', function () {
    const latLng = marker.getLngLat();
    lng = latLng.lng;
    lat = latLng.lat;
    // console.log(lng, lat);
    marker.setLngLat([lng, lat]);
    marker.setPopup(new mapboxgl.Popup().setHTML('<p>This is my Address.</p>'));
    marker.addTo(map);
  });

  addLocationBtn.addEventListener('click', function () {
    // console.log(lng, lat);
    addUserLocationFinal([lng, lat]);
    // redirectTo('/', 2500);
  });

  // ##### Capture 1st time load happens
  geoLocate.on('trackuserlocationstart', () => {
    console.log('A trackuserlocationstart event has occurred.');
  });

  // ##### Capture 2nd time load happens
  geoLocate.on('trackuserlocationend', () => {
    console.log('A trackuserlocationend event has occurred.');
  });

  // map.addControl(
  //   new mapboxgl.GeolocateControl({
  //     positionOptions: {
  //       enableHighAccuracy: true,
  //     },
  //     trackUserLocation: true,
  //     showUserHeading: true,
  //     showAccuracyCircle: false,
  //     showUserLocation: false,
  //   })
  // );

  // map.on('click', function (e) {
  //   console.log(`A click event has occurred at ${e.lngLat}`);

  // });
}
