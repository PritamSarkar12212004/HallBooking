export interface sendOtpApiInterface {
    phone: string
}
export interface verifyOtpInterface extends sendOtpApiInterface {
    otp: string
}
export interface createProfileInterface {
    name: string;
    email: string;
    city: string;
    photo: string;
    gender: "male" | "female" | "other";
    token: string;
}