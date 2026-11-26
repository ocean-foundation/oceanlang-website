export type OSId = 'linux' | 'macos' | 'windows';
export type ArchId = 'x86_64' | 'aarch64' | 'riscv64';
export type TargetId =
	| 'x86_64-linux'
	| 'aarch64-linux'
	| 'riscv64-linux'
	| 'aarch64-macos'
	| 'x86_64-macos'
	| 'x86_64-windows'
	| 'aarch64-windows';

export type InstallerTarget = {
	id: TargetId;
	os: OSId;
	osLabel: string;
	arch: ArchId;
	archLabel: string;
	shortLabel: string;
	format: string;
};

export const INSTALLER_REPO = 'ocean-foundation/installer';
export const COMPILER_REPO = 'ocean-foundation/ocean';
export const STDLIB_REPO = 'ocean-foundation/ocean-src';

export const RELEASE_LINKS = [
	{
		name: 'Ocean Compiler',
		repo: COMPILER_REPO,
		href: `https://github.com/${COMPILER_REPO}/releases`,
		description: 'Prebuilt compiler binaries, stable releases, and nightly builds.'
	},
	{
		name: 'Standard Library',
		repo: STDLIB_REPO,
		href: `https://github.com/${STDLIB_REPO}/tags`,
		description: 'Ocean standard library source releases, tagged to match each compiler release.'
	},
	{
		name: 'Ocean Installer',
		repo: INSTALLER_REPO,
		href: `https://github.com/${INSTALLER_REPO}/releases`,
		description: 'Interactive installer releases for Linux, macOS, and Windows.'
	}
] as const;

export const INSTALLER_TARGETS: readonly InstallerTarget[] = [
	{
		id: 'x86_64-linux',
		os: 'linux',
		osLabel: 'Linux',
		arch: 'x86_64',
		archLabel: 'x86_64',
		shortLabel: 'Linux (x86_64)',
		format: '.tar'
	},
	{
		id: 'aarch64-linux',
		os: 'linux',
		osLabel: 'Linux',
		arch: 'aarch64',
		archLabel: 'ARM64 (aarch64)',
		shortLabel: 'Linux (ARM64)',
		format: '.tar'
	},
	{
		id: 'riscv64-linux',
		os: 'linux',
		osLabel: 'Linux',
		arch: 'riscv64',
		archLabel: 'RISC-V 64 (riscv64)',
		shortLabel: 'Linux (RISC-V 64)',
		format: '.tar'
	},
	{
		id: 'aarch64-macos',
		os: 'macos',
		osLabel: 'macOS',
		arch: 'aarch64',
		archLabel: 'Apple Silicon (aarch64)',
		shortLabel: 'macOS (Apple Silicon)',
		format: '.tar'
	},
	{
		id: 'x86_64-macos',
		os: 'macos',
		osLabel: 'macOS',
		arch: 'x86_64',
		archLabel: 'Intel (x86_64)',
		shortLabel: 'macOS (Intel)',
		format: '.tar'
	},
	{
		id: 'x86_64-windows',
		os: 'windows',
		osLabel: 'Windows',
		arch: 'x86_64',
		archLabel: 'x86_64',
		shortLabel: 'Windows (x86_64)',
		format: '.tar'
	},
	{
		id: 'aarch64-windows',
		os: 'windows',
		osLabel: 'Windows',
		arch: 'aarch64',
		archLabel: 'ARM64 (aarch64)',
		shortLabel: 'Windows (ARM64)',
		format: '.tar'
	}
] as const;

export const OS_GROUPS: readonly { id: OSId; label: string; targets: InstallerTarget[] }[] = [
	{ id: 'linux', label: 'Linux', targets: INSTALLER_TARGETS.filter((t) => t.os === 'linux') },
	{ id: 'macos', label: 'macOS', targets: INSTALLER_TARGETS.filter((t) => t.os === 'macos') },
	{ id: 'windows', label: 'Windows', targets: INSTALLER_TARGETS.filter((t) => t.os === 'windows') }
];

const TARGET_MAP = new Map<string, InstallerTarget>(
	INSTALLER_TARGETS.map((target) => [target.id, target])
);

export function getTarget(id: string): InstallerTarget | undefined {
	return TARGET_MAP.get(id);
}

export function isValidTarget(id: string): id is TargetId {
	return TARGET_MAP.has(id);
}

type NavigatorWithUAData = Navigator & {
	userAgentData?: {
		platform?: string;
		getHighEntropyValues?: (hints: string[]) => Promise<{
			architecture?: string;
			platform?: string;
		}>;
	};
};

function detectAppleSiliconViaWebGL(): boolean | null {
	try {
		const canvas = document.createElement('canvas');
		const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
		if (!gl || !('getParameter' in gl)) return null;
		const webgl = gl as WebGLRenderingContext;
		const debugInfo = webgl.getExtension('WEBGL_debug_renderer_info');
		const renderer = String(
			debugInfo
				? webgl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
				: webgl.getParameter(webgl.RENDERER)
		);
		if (/apple\s+(m\d|gpu)/i.test(renderer)) return true;
		if (/intel|amd|radeon|nvidia/i.test(renderer)) return false;
	} catch {
		// Ignore WebGL restrictions.
	}
	return null;
}

export async function detectPlatformTarget(): Promise<InstallerTarget | null> {
	if (typeof navigator === 'undefined') return null;

	const nav = navigator as NavigatorWithUAData;
	const ua = navigator.userAgent || '';
	const legacyPlatform = navigator.platform || '';

	let os: OSId | null = null;
	let arch: ArchId | null = null;

	if (nav.userAgentData?.getHighEntropyValues) {
		try {
			const hints = await nav.userAgentData.getHighEntropyValues(['architecture', 'platform']);
			const hintPlatform = (hints.platform || nav.userAgentData.platform || '').toLowerCase();
			if (hintPlatform.includes('mac')) os = 'macos';
			else if (hintPlatform.includes('win')) os = 'windows';
			else if (hintPlatform.includes('linux')) os = 'linux';

			const hintArch = (hints.architecture || '').toLowerCase();
			if (hintArch.includes('arm') || hintArch.includes('aarch64')) arch = 'aarch64';
			else if (hintArch.includes('riscv')) arch = 'riscv64';
			else if (hintArch.includes('x86')) arch = 'x86_64';
		} catch {
			// Fall back to userAgent / platform detection.
		}
	}

	if (!os) {
		const combined = `${legacyPlatform} ${ua}`;
		if (/android|iphone|ipad|ipod/i.test(combined)) {
			return null;
		}
		if (/mac/i.test(combined)) os = 'macos';
		else if (/win/i.test(combined)) os = 'windows';
		else if (/linux|x11/i.test(combined)) os = 'linux';
	}

	if (!os) return null;

	if (!arch) {
		const combined = `${legacyPlatform} ${ua}`;
		if (/riscv64/i.test(combined)) {
			arch = 'riscv64';
		} else if (/aarch64|arm64|armv8/i.test(combined)) {
			arch = 'aarch64';
		} else if (os === 'macos') {
			const appleSilicon = detectAppleSiliconViaWebGL();
			arch = appleSilicon === false ? 'x86_64' : 'aarch64';
		} else {
			arch = 'x86_64';
		}
	}

	const candidate = `${arch}-${os}`;
	return getTarget(candidate) ?? getTarget(`x86_64-${os}`) ?? null;
}
