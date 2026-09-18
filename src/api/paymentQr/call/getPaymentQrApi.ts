import apiRoute from "../../../const/api/apiRoutes";
import {
    getPaymentQrInterface,
} from "../../../interface/api/apiRequireInterface";
import { PaymentQrSettings } from "../../../interface/api/paymentQrInterface";
import { apiPaymentQr } from "../../../utils/api";

const getPaymentQrApi = async (
    data: getPaymentQrInterface
): Promise<PaymentQrSettings> => {
    const response = await apiPaymentQr.get(apiRoute.paymentQr.root, {
        headers: {
            Authorization: `Bearer ${data.token}`,
        },
    });
    return response.data?.data as PaymentQrSettings;
};

export default getPaymentQrApi;