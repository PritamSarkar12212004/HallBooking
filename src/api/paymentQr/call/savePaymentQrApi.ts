import apiRoute from "../../../const/api/apiRoutes";
import {
    savePaymentQrInterface,
} from "../../../interface/api/apiRequireInterface";
import { PaymentQrSettings } from "../../../interface/api/paymentQrInterface";
import { apiPaymentQr } from "../../../utils/api";

const savePaymentQrApi = async (
    data: savePaymentQrInterface
): Promise<PaymentQrSettings> => {
    const response = await apiPaymentQr.put(
        apiRoute.paymentQr.root,
        {
            bankHolderName: data.bankHolderName,
            qrUrl: data.qrUrl,
        },
        {
            headers: {
                Authorization: `Bearer ${data.token}`,
            },
        }
    );
    return response.data?.data as PaymentQrSettings;
};

export default savePaymentQrApi;