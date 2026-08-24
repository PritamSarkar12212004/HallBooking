import apiRoute from "../../../const/api/apiRoutes";
import { verifyOtpInterface } from "../../../interface/api/apiRequireInterface";
import { apiAuth } from "../../../utils/api";

const verifyOtpApi = async ({
    phone,
    otp,
}: verifyOtpInterface) => {

    const response = await apiAuth.post(
        apiRoute.auth.otp.Verify,
        {
            phone,
            otp,
        }
    );

    return response.data;
};

export default verifyOtpApi;