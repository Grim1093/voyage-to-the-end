import { NextResponse } from 'next/server';

// [Architecture] We configure the matcher to bypass static files and Next.js internal routing.
// This prevents our middleware from firing unnecessarily and degrading GPU/Network performance.
export const config = {
    matcher: [
        '/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)',
    ],
};

export async function proxy(req) {
    const url = req.nextUrl;
    const hostname = req.headers.get('host');

    // [Architecture] Define the Master Control Plane domains that bypass MSaaS white-labeling
    const baseDomains = [
        'localhost:3001',
        process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'voyage-to-the-end.vercel.app'
    ];

    // Determine if the incoming request is operating on a bespoke tenant domain
    const isCustomDomain = !baseDomains.some(domain => hostname.includes(domain));

    if (isCustomDomain) {
        console.log(`[Edge Proxy] Step 1: MSaaS custom domain detected -> [${hostname}]`);
        
        try {
            console.log(`[Edge Proxy] Step 2: Querying Global Ledger for domain resolution...`);
            
            // Initiate a hyper-fast fetch to our backend to resolve the domain to a slug
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
            const response = await fetch(`${apiUrl}/events/domain/${hostname}`, {
                // Keep-alive connection for Edge-to-Node speed
                headers: { 'Connection': 'keep-alive' }, 
                // Cache the resolution for 60 seconds to prevent hammering the PostgreSQL index on every page load
                next: { revalidate: 60 } 
            });

            if (!response.ok) {
                console.error(`[Edge Proxy] Failure Point A: Domain [${hostname}] not found in Global Ledger. Rerouting to 404.`);
                return NextResponse.rewrite(new URL('/404', req.url));
            }

            const payload = await response.json();
            const { slug, theme_config } = payload.data;

            console.log(`[Edge Proxy] Step 3: Domain resolved to Node [${slug}]. Injecting theme payloads and rewriting timeline...`);

            // [Architecture] Transparently rewrite the URL to our existing slug dynamic route.
            // If the user visited 'apple-event.com/about', it rewrites under the hood to '/[slug]/about'
            const targetUrl = new URL(`/${slug}${url.pathname}`, req.url);
            const rewriteResponse = NextResponse.rewrite(targetUrl);

            // Inject the MSaaS theme configuration directly into the headers so the Next.js Server Component can read it
            rewriteResponse.headers.set('x-tenant-theme', JSON.stringify(theme_config || {}));
            rewriteResponse.headers.set('x-tenant-domain', hostname);

            return rewriteResponse;

        } catch (error) {
            console.error(`[Edge Proxy] CRITICAL Failure Point B: Edge-to-Node uplink severed during domain resolution.`, error.message);
            // Graceful degradation: If the backend drops, show a standard error page, do not crash the Vercel edge
            return NextResponse.rewrite(new URL('/500', req.url));
        }
    }

    // If it is a base domain request, allow it to pass normally to the Global Directory or Admin Control Plane
    return NextResponse.next();
}