import axios from "axios";
import useSWR from "swr";

const fetcher = (params) =>
    axios.get(params.url, {
        // headers: {
        //     Authorization: `Bearer ${params.token}`
        // },
        params: {
            token: params.token
        }
    }).then((res) => res.data);

const useUserDetails = (params) => {

    const { data, error, isLoading, mutate } = useSWR(        
        params.token ?
            {
                // url: "/api/details",
                url: "http://localhost:3012/api/auth/session",
                token: params.token,
            }
            :
            null,
        fetcher,
        {
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            shouldRetryOnError: false,
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };

};

export default useUserDetails;