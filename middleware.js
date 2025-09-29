import { NextResponse } from 'next/server';
import verifySession from './util/verifySession';

export async function middleware(request) {

    // console.log("request.nextUrl.pathname", request.nextUrl.pathname)

    // Only run middleware for /api/user/ routes
    if (request.nextUrl.pathname.startsWith('/api/user/')) {
        // Example: Add custom logic here
        // For example, check authentication, log, etc.
        // If you want to block, you can return NextResponse.redirect or NextResponse.json
        // console.log('Middleware running for /api/user/ route:', request.nextUrl.pathname);

        const userDetails = await verifySession()
        
        if (!userDetails) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        } else {
            // console.log("userDetails", userDetails)
        }

        const response = NextResponse.next();
        response.headers.set('x-user-id', userDetails.user_id);
        return response;
        // return NextResponse.next();
    }

    // For all other routes, do nothing (let them pass through)
    return NextResponse.next();
}

// Limit the middleware to only /api/user/ routes
export const config = {
    matcher: [
        '/api/user/:path*'
    ],
};