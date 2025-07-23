import Script from "next/script";
import { useEffect } from "react";
import { useStore } from "@/hooks/useStore";

// Non typescript version, if copying consider using the typescript version instead from a repo like amcot or battle-trap

export default function ArticlesAd({ style }) {

    const darkMode = useStore((state) => state.darkMode)

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_ARTICLES_OAUTH_ID) {
            console.log("NEXT_PUBLIC_ARTICLES_OAUTH_ID is not set, skipping Articles Media Sign In button initialization.");
        }
    }, []);

    return (
        <div>

            <Script
                src={process.env.NODE_ENV === "development" ?
                    `${process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS_ADDRESS}/js/ad.js`
                    // "https://accounts.articles.media/js/signin.js"
                    :
                    "https://accounts.articles.media/js/ad.js"
                }
                strategy="afterInteractive"
                data-version="1"
                // data-articles-color-mode="Dark"
                // data-articles-button-style={style}
                // data-articles-client-id={process.env.NEXT_PUBLIC_ARTICLES_OAUTH_ID}
                // data-articles-redirect-uri="https://localhost:3002"
                // data-articles-redirect-uri={process.env.NEXT_PUBLIC_ARTICLES_REDIRECT_URI}
                // data-articles-authHost={
                //     process.env.NODE_ENV == "development" ? // "http://localhost:3001" 
                //         process.env.NEXT_PUBLIC_LOCAL_ACCOUNTS_ADDRESS
                //         :
                //         "https://accounts.articles.media"
                // }
            />

            <div className={"articles-media-ad"}>

            </div>

        </div>
    );
}
