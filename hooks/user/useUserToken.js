import axios from "axios";
import useSWR from "swr";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useUserToken = () => {

    const { data, error, isLoading, mutate } = useSWR(
        // "http://localhost:3012/api/auth/session",
        "/api/token",
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

export default useUserToken;