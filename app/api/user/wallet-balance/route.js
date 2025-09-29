import { ObjectId } from 'mongodb';

import { NextResponse } from 'next/server';

import clientPromise from '@/util/mongodb';
import verifySession from '@/util/verifySession';

export async function GET(req) {

    const db = (await clientPromise).db();
    const userId = req.headers.get('x-user-id');
    console.log("userId", userId)
    // return NextResponse.json({ error: 'TEST' }, { status: 401 });

    // const cookieStore = await cookies();
    // const session_token = cookieStore.get('sess')?.value

    // const userDetails = await verifySession()
    // if ( !userDetails ) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // } else {
    //     console.log("userDetails", userDetails)
    // }

    // Check last claim date
    var result = await db
        .collection("blackjack_wallets")
        .findOne({
            user_id: new ObjectId(userId),
        })

    // If last claim date is more then 24 hours then claim
    if (result) {

        return NextResponse.json(result)

    } else {

        var insert_result = await db
            .collection("blackjack_wallets")
            .insertOne({
                user_id: new ObjectId(userId),
                last_claim: new Date(),
                total: 100
            })

        return NextResponse.json({
            "message": "New user",
            result: insert_result
        })

    }
}