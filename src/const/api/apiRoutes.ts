const apiRoute = {
    auth: {
        otp: {
            Send: "/send-otp",
            Verify: "/verify-otp"
        },
        profile: "/profile",
    },
    booking: {
        root: "/",
        byId: (id: string) => `/${id}`,
        applicant: (id: string) => `/${id}/applicant`,
        event: (id: string) => `/${id}/event`,
        arrangements: (id: string) => `/${id}/arrangements`,
        payment: (id: string) => `/${id}/payment`,
        declaration: (id: string) => `/${id}/declaration`,
    }
}
export default apiRoute