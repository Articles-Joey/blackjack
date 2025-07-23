import useSWR from "swr";

// import { useSelector, useDispatch } from 'react-redux';

import axios from "axios";

const fetcher = (url) => axios.get(url).then((res) => res.data);

const useUserFriends = () => {

    // const url = userId ? `/api/posts?userId=${userId}` : "/api/posts";

    // const userReduxState = useSelector((state) => state.auth.user_details)
    const userReduxState = false

    const { data, error, isLoading, mutate } = useSWR(
        (userReduxState._id ?
            "/api/user/friends"
            :
            null
        ),
        fetcher,
        {
            dedupingInterval: ((1000 * 60) * 30),
            focusThrottleInterval: (1000 * 60 * 30),
        }
    );

    return {
        data,
        error,
        isLoading,
        mutate,
    };
};

export default useUserFriends;