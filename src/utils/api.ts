import axios from 'axios'
import envApi from '../const/api/envApi';

export const apiAuth = axios.create({
    baseURL: `${envApi.baseUri}${envApi.Auth.root}`
})


