import useSWR from "swr";

const fetcher = async (obj) => {
    const url = new URL(obj.url, window.location.origin);
    url.searchParams.set('game', obj.game);
    const res = await fetch(url.toString());
    return res.json();
};

const options = {
    dedupingInterval: ((1000 * 60) * 30),
    // fallbackData: []
}

const useGameScoreboard = (params) => {

    const { data, error, isLoading, isValidating, mutate } = useSWR(
        params?.game ?
            {
                url: "/api/community/games/scoreboard",
                game: params.game,
            }
            :
            null,
        fetcher,
        options
    );

    return {
        data,
        error,
        isLoading,
        isValidating,
        mutate,
    };
};

export default useGameScoreboard;