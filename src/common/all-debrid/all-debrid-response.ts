interface AllDebridSuccessResponse<T> {
    status: 'success',
    data: T
}

interface AllDebridErrorResponse {
    status: 'error',
    error : {
        code: string,
        message: string
    }
}

export type AllDebridResponse<T> = AllDebridSuccessResponse<T> | AllDebridErrorResponse;