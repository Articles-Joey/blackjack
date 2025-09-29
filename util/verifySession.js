import { cookies } from "next/headers";

export default async function verifySession(token) {

    const cookieStore = await cookies();
    const session_token = cookieStore.get('sess')?.value

    const endpoint = (process.env.NODE_ENV == "development" ?
        'http://localhost:3012'
        :
        'https://accounts.articles.media'
    ) + `/api/auth/session?token=${encodeURIComponent(token || session_token)}`;

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!data || !data.user_id) {
        return false;
    }

    return data;
}