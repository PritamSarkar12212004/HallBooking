import apiRoute from "../../../const/api/apiRoutes";
import { sendOtpApiInterface } from "../../../interface/api/apiRequireInterface";
import { apiAuth } from "../../../utils/api";

const sendOtpApi = async (phone: sendOtpApiInterface) => {
    const response = await apiAuth.post(apiRoute.auth.otp.Send, phone)
    return response.data
}
export default sendOtpApi