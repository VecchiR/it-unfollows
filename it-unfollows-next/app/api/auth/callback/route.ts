import { cookies } from 'next/headers';

export async function GET(request: Request) {
    const searchParams = new URL(request.url).searchParams;
    const code = searchParams.get('code');
    const verifier = cookies().get('code_verifier')?.value;

    if (!code || !verifier) {
        return new Response('Missing code or verifier', { status: 400 });
    }

    const tokens = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: process.env.SPOTIFY_CLIENT_ID!,
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
            code_verifier: verifier,
        }),
    }).then(res => res.json());

    // Store access token in a secure cookie
    cookies().set('spotify_access_token', tokens.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour
    });

    return Response.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}`);
}