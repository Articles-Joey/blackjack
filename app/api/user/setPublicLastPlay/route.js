import { ObjectId } from 'mongodb';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';

export async function POST(req) {
    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');
    let body = await req.json()

    let result = await db
        .collection("blackjack_wallets")
        .updateOne(
            { user_id: new ObjectId(userId) },
            {
                $set: { public_last_play: body.state }
            }
        )

    return NextResponse.json(body.state)
}