import clientPromise from '@/util/mongodb';
import minimalMongodbUserProject from '@/util/mongodbUserProjects/minimal';

import { NextResponse } from 'next/server';

export async function GET(req) {

    const db = (await clientPromise).db();

    const {
        user_id
    } = Object.fromEntries(req.nextUrl.searchParams)

    const aggregation = [
        {
            '$match': {
                'public': true
            }
        },
        {
            '$lookup': {
                'from': 'articles_users',
                'let': {
                    'user_id': '$user_id'
                },
                'pipeline': [
                    {
                        '$match': {
                            '$expr': {
                                '$eq': [
                                    '$$user_id', '$_id'
                                ]
                            }
                        }
                    }, {
                        '$project': {
                            ...minimalMongodbUserProject,
                        }
                    }
                ],
                'as': 'populated_user'
            }
        },
        {
            '$unwind': {
                'path': '$populated_user'
            }
        },
        {
            '$sort': {
                'total': -1
            }
        }
    ]

    return NextResponse.json(
        await db.collection("blackjack_wallets")
            .aggregate(aggregation)
            .toArray()
    );
}