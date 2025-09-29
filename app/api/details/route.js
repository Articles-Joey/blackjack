// import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// import clientPromise from '@/util/mongodb';

// This will only work when called on a subdomain, not a partner OAuth application

// Not used 

export async function GET(req) {
    try {

        return NextResponse.json({ error: 'No longer used' }, { status: 500 });

        // const { searchParams } = new URL(req.url);
        // const authHeader = req.headers.get('authorization');
        // const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        // console.log("token", token, authHeader.oauth_token)

        // const cookieStore = await cookies();
        const { searchParams } = new URL(req.url);
        const token = searchParams.get('token');
        return NextResponse.json({
            token: token
        });
        // const session_token = cookieStore.get('sess')?.value

        // const oauth_token = session_token;
        // console.log("oauth_token", oauth_token, cookieStore.getAll());

    } catch (error) {

        console.error("Error in GET /api/auth/oauth/articles/details:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }

}