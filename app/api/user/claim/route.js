import { ObjectId } from 'mongodb';

import { add, sub } from 'date-fns';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';

export async function POST(req) {
    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');

    // Check last claim date
    var result = await db
        .collection("blackjack_wallets")
        .findOne({
            user_id: new ObjectId(userId),
            $or: [
                {
                    last_claim: {
                        $lt: sub(new Date(), { days: 1 }),
                    }
                },
                {
                    last_claim: {
                        $exists: false
                    }
                }
            ]
        })

    // If last claim date is more then 24 hours then claim
    if (result) {

        const result = await db
            .collection("blackjack_wallets")
            .updateOne(
                { user_id: new ObjectId(userId) },
                {
                    $set: { last_claim: new Date() },
                    $inc: { total: 100 }
                }
            )

        await result

        return NextResponse.json(
            'Added 100 points to wallet'
        )

    } else {

        return NextResponse.json('You need to wait 24 hours to claim again.', { status: 400 })

    }
}