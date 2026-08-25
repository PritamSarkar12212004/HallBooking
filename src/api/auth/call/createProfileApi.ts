import apiRoute from "../../../const/api/apiRoutes";
import { createProfileInterface } from "../../../interface/api/apiRequireInterface";
import { apiAuth } from "../../../utils/api";

const createProfileApi = async (data: createProfileInterface) => {
    const response = await apiAuth.put(apiRoute.auth.profile, {
        name: data.name,
        email: data.email,
        city: data.city,
        gender: data.gender,
        photo: data.photo
    }, {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    }
    )
    return response.data?.data
}
export default createProfileApi