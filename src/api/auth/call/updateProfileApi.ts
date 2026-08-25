import apiRoute from "../../../const/api/apiRoutes";
import { profileUpdateInterface } from "../../../interface/api/apiRequireInterface";
import { apiAuth } from "../../../utils/api";

const updateProfileApi = async (data: profileUpdateInterface) => {
    const response = await apiAuth.patch(apiRoute.auth.profile, {
        name: data.name,
        email: data.email,
        city: data.city,
        photo: data.photo,
    }, {
        headers: {
            Authorization: `Bearer ${data.token}`
        }
    }
    )
    return response.data?.data
}
export default updateProfileApi