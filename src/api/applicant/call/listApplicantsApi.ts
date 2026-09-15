import apiRoute from "../../../const/api/apiRoutes";
import { apiApplicant } from "../../../utils/api";
import { applicantListInterface } from "../../../interface/api/applicantInterface";

export type ApplicantSort = "recent" | "oldest" | "name" | "bookings";

export interface ApplicantPagination {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
}

export interface ApplicantsPage {
    applicants: applicantListInterface[];
    pagination: ApplicantPagination;
}

export interface ListApplicantsParams {
    token: string;
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: ApplicantSort;
}

const listApplicantsApi = async (data: ListApplicantsParams): Promise<ApplicantsPage> => {
    const response = await apiApplicant.get(apiRoute.applicant.root, {
        headers: {
            Authorization: `Bearer ${data.token}`
        },
        params: {
            page: data.page ?? 1,
            pageSize: data.pageSize ?? 10,
            sort: data.sort ?? "recent",
            ...(data.search?.trim() ? { search: data.search.trim() } : {}),
        }
    })
    const payload = response.data?.data;
    return {
        applicants: payload?.applicants ?? [],
        pagination: payload?.pagination ?? {
            page: data.page ?? 1,
            pageSize: data.pageSize ?? 10,
            total: 0,
            totalPages: 0,
            hasMore: false,
        },
    }
}
export default listApplicantsApi;