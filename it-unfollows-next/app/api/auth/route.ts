
import { generateCodeChallenge, generateCodeVerifier } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
    const verifier = await generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    // Store verifier in a cookie
    cookies().set('code_verifier', verifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10 // 10 minutes
    });

    const params = new URLSearchParams({
        client_id: process.env.SPOTIFY_CLIENT_ID!,
        response_type: 'code',
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        scope: 'user-read-private user-read-email user-follow-read user-follow-modify',
        code_challenge_method: 'S256',
        code_challenge: challenge,
    });

    return Response.redirect(`https://accounts.spotify.com/authorize?${params.toString()}`);
}