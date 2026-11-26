import { INSTALLER_REPO, isValidTarget, INSTALLER_TARGETS } from '#lib/downloads.ts';
import type { RequestHandler } from './$types';

export const prerender = false;
export const trailingSlash = 'ignore';

const LATEST_API_URL = `https://api.github.com/repos/${INSTALLER_REPO}/releases/latest`;
const LATEST_WEB_URL = `https://github.com/${INSTALLER_REPO}/releases/latest`;
const USER_AGENT = 'oceanlang-website';

type GitHubAsset = {
	name: string;
	browser_download_url: string;
};

type GitHubRelease = {
	tag_name?: string;
	assets?: GitHubAsset[];
};

function findAssetUrl(assets: GitHubAsset[], target: string): string | null {
	const tarMatch = assets.find((asset) => asset.name.endsWith(`_${target}.tar`));
	if (tarMatch) return tarMatch.browser_download_url;

	const anyArchiveMatch = assets.find((asset) =>
		new RegExp(`_${target}\\.(tar(\\.gz|\\.xz)?|zip)$`).test(asset.name)
	);
	return anyArchiveMatch?.browser_download_url ?? null;
}

async function resolveLatestAssetUrl(
	fetchFn: typeof fetch,
	target: string
): Promise<string | null> {
	// First try the GitHub Releases API so we match the exact published asset filename.
	try {
		const response = await fetchFn(LATEST_API_URL, {
			headers: {
				Accept: 'application/vnd.github+json',
				'User-Agent': USER_AGENT
			}
		});
		if (response.ok) {
			const release = (await response.json()) as GitHubRelease;
			if (Array.isArray(release.assets)) {
				const assetUrl = findAssetUrl(release.assets, target);
				if (assetUrl) return assetUrl;
			}
			if (release.tag_name) {
				return `https://github.com/${INSTALLER_REPO}/releases/download/${encodeURIComponent(release.tag_name)}/ocean-installer_${release.tag_name}_${target}.tar`;
			}
		}
	} catch {
		// Fall through to the non-API redirect lookup.
	}

	// Fallback: follow GitHub's non-rate-limited /releases/latest redirect to discover the tag.
	try {
		const response = await fetchFn(LATEST_WEB_URL, {
			redirect: 'manual',
			headers: {
				'User-Agent': USER_AGENT
			}
		});
		const location = response.headers.get('location');
		const tagMatch = location?.match(/\/releases\/tag\/([^/?#]+)/);
		if (tagMatch?.[1]) {
			const tag = decodeURIComponent(tagMatch[1]);
			return `https://github.com/${INSTALLER_REPO}/releases/download/${encodeURIComponent(tag)}/ocean-installer_${tag}_${target}.tar`;
		}
	} catch {
		// Fall through to releases page fallback.
	}

	return null;
}

export const GET: RequestHandler = async ({ params, fetch }) => {
	const target = params.target;
	if (!isValidTarget(target)) {
		const supported = INSTALLER_TARGETS.map((t) => t.id).join(', ');
		return new Response(`Unsupported installer target "${target}". Supported targets: ${supported}\n`, {
			status: 404,
			headers: { 'Content-Type': 'text/plain; charset=utf-8' }
		});
	}

	const assetUrl = await resolveLatestAssetUrl(fetch, target);
	return new Response(null, {
		status: 302,
		headers: {
			Location: assetUrl ?? LATEST_WEB_URL,
			'Cache-Control': 'public, max-age=300'
		}
	});
};
