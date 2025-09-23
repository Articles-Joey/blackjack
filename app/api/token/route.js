// import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// import { NextResponse } from 'next/server';
// import clientPromise from '@/util/mongodb';

// This will only work when called on a subdomain, not a partner OAuth application

export async function GET(req) {
    try {

        // const { searchParams } = new URL(req.url);
        // const searchParamsObject = Object.fromEntries(searchParams.entries());

        const cookieStore = await cookies();

        const session_token = cookieStore.get('sess')?.value

        const oauth_token = session_token;

        if (!session_token) {
            return NextResponse.json({ error: 'No session token found' }, { status: 400 });
        }

        return NextResponse.json(session_token, { status: 200 });
        
    } catch (error) {

        console.error("Error in GET /api/auth/oauth/articles/details:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }

}