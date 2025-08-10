interface UserProfile {
    country: string;
    display_name: string;
    email: string;
    explicit_content: {
        filter_enabled: boolean,
        filter_locked: boolean
    },
    external_urls: { spotify: string; };
    followers: { href: string; total: number; };
    href: string;
    id: string;
    images: Image[];
    product: string;
    type: string;
    uri: string;
}

interface Image {
    url: string;
    height: number | null;
    width: number | null;
}

interface FollowedArtistsRequest {
    type: "artist";
    after?: string;
    limit?: number;
}


interface FollowedArtistsResponse {
    href: string;
    limit: number;
    next: string;
    cursors: {
        after: string;
        before: string;
    }
    total: number;
    items: Artist[];
}

interface Artist {
    external_urls: {
        spotify: string
    };
    followers: {
        href: string | null;
        total: number;
    };
    genres: string[];
    href: string;
    id: string;
    images: Image[];
    name: string;
    popularity: number;
    type: "artist";
    uri: string;

}


interface Error {
    status: number;
    message: string;
}