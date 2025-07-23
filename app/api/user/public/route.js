import { ObjectId } from 'mongodb';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';

export async function POST(req) {
    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');

    await db
        .collection("blackjack_wallets")
        .updateOne(
            { user_id: new ObjectId(userId) },
            {
                $set: {
                    public: true,
                    public_last_play: true
                }
            }
        )

    return NextResponse.json(
        `Set public wallet`
    )
}