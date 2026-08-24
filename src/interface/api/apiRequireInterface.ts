export interface sendOtpApiInterface {
    phone: string
}
export interface verifyOtpInterface extends sendOtpApiInterface {
    otp: string
}