import { NextResponse } from 'next/server';
import getSignOutRedirectUrl from '@articles-media/articles-dev-box/getSignOutRedirectUrl';

export async function GET(req) {
    try {
        const redirectUrl = await getSignOutRedirectUrl(req);
        return NextResponse.redirect(redirectUrl);
    } catch (error) {
        return NextResponse.json({ error: 'Signout failed' }, { status: 500 });
    }
}