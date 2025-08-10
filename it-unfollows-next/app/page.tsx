import { cookies } from 'next/headers';
import Link from 'next/link';

export default async function Home() {
    const accessToken = cookies().get('spotify_access_token')?.value;

    if (!accessToken) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Link 
                    href="/api/auth"
                    className="bg-green-500 text-white px-6 py-3 rounded-full hover:bg-green-600"
                >
                    Login with Spotify
                </Link>
            </div>
        );
    }

    // Protected content here
    return (
        <main className="container mx-auto p-4">
            <p>pipipipopo</p>
        </main>
    );
}