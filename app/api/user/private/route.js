import { ObjectId } from 'mongodb';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';

export async function POST(req) {
    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');

    const result = await db
        .collection("blackjack_wallets")
        .updateOne(
            { user_id: new ObjectId(userId) },
            {
                $set: { public: false }
            }
        )

    return NextResponse.json(result)
}