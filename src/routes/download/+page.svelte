<script lang="ts">
	import { onMount } from 'svelte';
	import Code from '#lib/components/Code.svelte';
	import {
		INSTALLER_TARGETS,
		OS_GROUPS,
		RELEASE_LINKS,
		detectPlatformTarget,
		type InstallerTarget
	} from '#lib/downloads.ts';

	let selectedTarget = $state<InstallerTarget>(INSTALLER_TARGETS[0]);
	let detected = $state<boolean | null>(null);

	onMount(async () => {
		const match = await detectPlatformTarget();
		if (match) {
			selectedTarget = match;
			detected = true;
		} else {
			detected = false;
		}
	});

	const currentOsGroup = $derived(
		OS_GROUPS.find((group) => group.id === selectedTarget.os) ?? OS_GROUPS[0]
	);

	const installCommand = $derived(
		selectedTarget.os === 'windows'
			? `# Download and run in PowerShell\ntar -xf ocean-installer_*_${selectedTarget.id}.tar\n.\\ocean-installer.exe`
			: `# Extract and run from a terminal\ntar -xf ocean-installer_*_${selectedTarget.id}.tar\n./ocean-installer`
	);
</script>

<svelte:head>
	<title>Download — Ocean</title>
	<meta
		name="description"
		content="Download the Ocean installer for Linux, macOS, or Windows, or browse compiler and standard library releases on GitHub."
	/>
</svelte:head>

<main id="main" class="download-page">
	<section class="download-hero">
		<div class="download-intro">
			<p class="eyebrow"><span class="status-dot"></span>INSTALLER &amp; RELEASES</p>
			<h1>Download Ocean</h1>
			<p class="download-lead">
				Get the interactive Ocean installer to set up the compiler, standard library, and native
				toolchain for your system.
			</p>
		</div>

		<div class="recommended-card">
			<div class="card-top">
				<span class="detect-badge">
					{#if detected === true}
						Detected: {selectedTarget.shortLabel}
					{:else if detected === false}
						Select your platform
					{:else}
						Detecting your platform…
					{/if}
				</span>
				<span class="target-pill">{selectedTarget.id}</span>
			</div>

			<div class="os-switcher" role="tablist" aria-label="Operating system">
				{#each OS_GROUPS as group}
					<button
						type="button"
						role="tab"
						aria-selected={selectedTarget.os === group.id}
						class:active={selectedTarget.os === group.id}
						onclick={() => (selectedTarget = group.targets[0])}
					>
						{group.label}
					</button>
				{/each}
			</div>

			<div class="arch-switcher" aria-label="Architecture">
				{#each currentOsGroup.targets as target}
					<button
						type="button"
						class:active={selectedTarget.id === target.id}
						onclick={() => (selectedTarget = target)}
					>
						{target.archLabel}
					</button>
				{/each}
			</div>

			<div class="download-cta-row">
				<a
					class="button primary download-button"
					href={`/download/${selectedTarget.id}`}
					data-sveltekit-reload
				>
					<span>Download for {selectedTarget.shortLabel}</span>
					<span aria-hidden="true">↓</span>
				</a>
				<a class="button secondary" href="/docs/getting-started/">
					<span>Getting started</span>
					<span aria-hidden="true">→</span>
				</a>
			</div>

			<p class="direct-link-note">
				Direct link to latest release:
				<a href={`/download/${selectedTarget.id}`} data-sveltekit-reload>
					<code>/download/{selectedTarget.id}</code>
				</a>
			</p>
		</div>
	</section>

	<section class="download-section" aria-labelledby="quick-install-heading">
		<div class="section-header">
			<h2 id="quick-install-heading">Run the installer</h2>
			<p>
				Extract the downloaded archive and run the installer from a terminal. It will let you choose
				a stable or nightly release, an install location, native dependencies, and your
				<code>PATH</code>.
			</p>
		</div>
		<Code code={installCommand} label="Terminal" />
		<p class="docs-followup">
			Need full installation details or want to build from source? Read the
			<a href="/docs/getting-started/">Get started with Ocean</a> guide.
		</p>
	</section>

	<section class="download-section" aria-labelledby="all-platforms-heading">
		<div class="section-header">
			<h2 id="all-platforms-heading">All installer downloads</h2>
			<p>
				Each link redirects to the latest matching archive from the
				<code>ocean-foundation/installer</code> GitHub releases.
			</p>
		</div>

		<div class="platform-grid">
			{#each OS_GROUPS as group}
				<div class="platform-column">
					<h3>{group.label}</h3>
					<ul>
						{#each group.targets as target}
							<li>
								<a
									href={`/download/${target.id}`}
									data-sveltekit-reload
									class:current={selectedTarget.id === target.id}
								>
									<div>
										<strong>{target.archLabel}</strong>
										<span>/download/{target.id}</span>
									</div>
									<span class="dl-arrow" aria-hidden="true">↓</span>
								</a>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		</div>
	</section>

	<section class="download-section" aria-labelledby="github-releases-heading">
		<div class="section-header">
			<h2 id="github-releases-heading">GitHub releases</h2>
			<p>
				Browse all release tags, changelogs, nightly builds, and source archives directly on GitHub.
			</p>
		</div>

		<div class="releases-grid">
			{#each RELEASE_LINKS as item}
				<a class="release-card" href={item.href} target="_blank" rel="noopener noreferrer">
					<span class="release-repo">{item.repo}</span>
					<h3>{item.name} <span aria-hidden="true">↗</span></h3>
					<p>{item.description}</p>
				</a>
			{/each}
		</div>
	</section>
</main>

<style>
	.download-page {
		max-width: 1120px;
		margin: auto;
		padding: 64px 6% 96px;
	}

	.download-hero {
		display: grid;
		grid-template-columns: 1fr 1.15fr;
		gap: 48px;
		align-items: start;
		padding-bottom: 56px;
		border-bottom: 1px solid var(--line);
	}

	.download-intro h1 {
		font-size: clamp(40px, 4.5vw, 56px);
		line-height: 1.12;
		letter-spacing: -2px;
		font-weight: 500;
		margin: 20px 0 18px;
	}

	.download-lead {
		font-size: 16px;
		color: var(--muted);
		line-height: 1.8;
		max-width: 440px;
	}

	.recommended-card {
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--surface);
		padding: 28px;
	}

	.card-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 20px;
	}

	.detect-badge {
		font: 11px 'IBM Plex Mono', monospace;
		color: var(--accent);
	}

	.target-pill {
		font: 11px 'IBM Plex Mono', monospace;
		color: var(--muted);
		background: var(--raised);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 3px 8px;
	}

	.os-switcher {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 6px;
		padding: 4px;
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: 6px;
		margin-bottom: 14px;
	}

	.os-switcher button {
		padding: 9px 12px;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		color: var(--muted);
		transition: background 0.15s, color 0.15s;
	}

	.os-switcher button:hover {
		color: var(--text);
	}

	.os-switcher button.active {
		background: var(--raised);
		color: var(--text);
	}

	.arch-switcher {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 24px;
	}

	.arch-switcher button {
		padding: 7px 12px;
		border-radius: 4px;
		border: 1px solid var(--line);
		background: var(--bg);
		font: 11px 'IBM Plex Mono', monospace;
		color: var(--muted);
		transition: border-color 0.15s, color 0.15s, background 0.15s;
	}

	.arch-switcher button:hover {
		color: var(--text);
		border-color: var(--accent);
	}

	.arch-switcher button.active {
		background: var(--raised);
		color: var(--accent);
		border-color: var(--accent);
	}

	.download-cta-row {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.download-button {
		flex: 1 1 auto;
	}

	.direct-link-note {
		margin-top: 18px;
		font-size: 12px;
		color: var(--muted);
	}

	.direct-link-note a {
		color: var(--accent);
	}

	.direct-link-note code,
	.section-header code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.9em;
		background: var(--raised);
		border: 1px solid var(--line);
		border-radius: 4px;
		padding: 1px 5px;
	}

	.download-section {
		padding-top: 52px;
	}

	.section-header {
		margin-bottom: 24px;
	}

	.section-header h2 {
		font-size: 28px;
		font-weight: 500;
		letter-spacing: -0.9px;
		margin-bottom: 10px;
	}

	.section-header p {
		font-size: 14px;
		color: var(--muted);
		max-width: 620px;
	}

	.docs-followup {
		font-size: 13px;
		color: var(--muted);
	}

	.docs-followup a {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.platform-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}

	.platform-column {
		border: 1px solid var(--line);
		border-radius: 7px;
		background: var(--surface);
		padding: 22px;
	}

	.platform-column h3 {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid var(--line);
	}

	.platform-column ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.platform-column a {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 12px 14px;
		border: 1px solid var(--line);
		border-radius: 5px;
		background: var(--bg);
		transition: background 0.15s, border-color 0.15s;
	}

	.platform-column a:hover,
	.platform-column a.current {
		background: var(--raised);
		border-color: var(--accent);
	}

	.platform-column strong {
		display: block;
		font-size: 13px;
		font-weight: 600;
	}

	.platform-column a span {
		display: block;
		font: 10px 'IBM Plex Mono', monospace;
		color: var(--muted);
		margin-top: 3px;
	}

	.platform-column .dl-arrow {
		font-size: 15px;
		color: var(--accent);
		margin-top: 0;
	}

	.releases-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 16px;
	}

	.release-card {
		display: flex;
		flex-direction: column;
		padding: 24px;
		border: 1px solid var(--line);
		border-radius: 7px;
		background: var(--surface);
		transition: background 0.15s, border-color 0.15s;
	}

	.release-card:hover {
		background: var(--raised);
		border-color: var(--accent);
	}

	.release-repo {
		font: 10px 'IBM Plex Mono', monospace;
		color: var(--accent);
		margin-bottom: 12px;
	}

	.release-card h3 {
		font-size: 17px;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}

	.release-card h3 span {
		color: var(--accent);
	}

	.release-card p {
		font-size: 13px;
		color: var(--muted);
		line-height: 1.75;
	}

	@media (max-width: 960px) {
		.download-hero {
			grid-template-columns: 1fr;
			gap: 32px;
		}

		.platform-grid,
		.releases-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 760px) {
		.download-page {
			padding: 40px 6% 70px;
		}

		.recommended-card {
			padding: 20px;
		}

		.card-top {
			flex-wrap: wrap;
		}

		.download-cta-row {
			flex-direction: column;
		}
	}
</style>
