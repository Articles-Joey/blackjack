import { ObjectId } from 'mongodb';

import { add, sub } from 'date-fns';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';

export async function POST(req) {
    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');
    const body = await req.json();
    const { play } = body

    if (!play) {
        return NextResponse.json('Send the value you want to play.', { status: 400 })
    }

    // Check balance to confirm they can play
    var canPlay = await db
        .collection("blackjack_wallets")
        .findOne({
            user_id: new ObjectId(userId),
            total: { $gte: play }
        })

    // If last claim date is more then 24 hours then claim
    if (canPlay) {

        const result = await db
            .collection("blackjack_wallets")
            .updateOne(
                { user_id: new ObjectId(userId) },
                {
                    $set: { last_claim: new Date() },
                    $inc: { total: 100 }
                }
            )

        return NextResponse.json({
            message: 'Added 100 points to wallet',
            result
        })

    } else {

        return NextResponse.json(
            {
                message: 'You dont have enough points to make that play.'
            },
            {
                status: 400
            }
        )

    }
}