import { NextResponse } from 'next/server';

export async function POST(request) {
    const response = NextResponse.json({ message: 'Signed out' });
    response.cookies.set('sess', '', {
        httpOnly: true,
        path: '/',
        expires: new Date(0),
    });
    return response;
}