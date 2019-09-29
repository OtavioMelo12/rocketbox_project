import axios from 'axios';

const api = axios.create({
  baseURL: 'https://rocketbox-backend2.herokuapp.com',
});

export default api;