/** @type {import('next').NextConfig} */
const nextConfig = {
    reactCompiler: true,
    images: {
        // domains: ['cdn.articles.media', 'articles-website.s3.amazonaws.com', 'd3bzp9rk94ifwy.cloudfront.net'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'cdn.articles.media',
                port: '',
                // pathname: '',
            },
            {
                protocol: 'https',
                hostname: 'articles-website.s3.amazonaws.com',
                port: '',
                // pathname: '',
            },
        ],
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'SAMEORIGIN',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
