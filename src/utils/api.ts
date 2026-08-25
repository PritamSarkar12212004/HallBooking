import axios from 'axios'
import envApi from '../const/api/envApi';

export const apiAuth = axios.create({
    baseURL: `${envApi.baseUri}${envApi.Auth.root}`
})

export const apiBooking = axios.create({
    baseURL: `${envApi.baseUri}${envApi.Booking.root}`
})


