<script lang="ts">
	import Code from '#lib/components/Code.svelte';
	import Wordmark from '#lib/components/Wordmark.svelte';
	let selected = $state(0);

	const examples = [
		{
			title: 'Print a formatted message',
			file: 'hello.oc',
			code: 'package main;\n\nimport "io";\n\nfunc main() {\n    name := "Ocean";\n    io.Printfln("Hello, {}!", name);\n}',
			output: 'Hello, Ocean!',
			explanation: 'A small program, from source to console output.'
		},
		{
			title: 'Copy a dynamic array',
			file: 'values.oc',
			code: 'package main;\n\nimport "io";\n\nfunc main() {\n    original := []int{1, 2, 3};\n    copy := original;\n    copy[0] = 42;\n\n    io.Println(original);\n    io.Println(copy);\n}',
			output: '[1 2 3]\n[42 2 3]',
			explanation: 'Change the copy, keep the original. Each dynamic array has its own data.'
		},
		{
			title: 'Use a generic struct',
			file: 'generics.oc',
			code: 'package main;\n\nimport "io";\n\nstruct Box<T> { value T; }\n\nfunc main() {\n    answer := Box<int>{42};\n    io.Println(answer.value);\n}',
			output: '42',
			explanation:
				'Box<T> defines a family of types. Choosing Box<int> gives this value an integer field; choosing Box<string> would create a different type with a string field.'
		}
	];
</script>

<svelte:head>
	<title>Ocean Programming Language</title>
</svelte:head>

<main id="main">
	<section class="section masthead">
		<div>
			<h1>
				<Wordmark />
				<span class="sr-only">Ocean</span>
			</h1>
			<p class="slogan">
				A low-level language for the modern age,<br class="desktop-break" />
				whether it's systems programming or full-stack applications.
			</p>
		</div>
		<a class="get-started" href="/docs/getting-started/">
			Get started <span aria-hidden="true">→</span>
		</a>
	</section>

	<section id="language" class="section language-section">
		<h2>Why Ocean?</h2>
		<div class="why-columns">
			<div class="why-column">
				<h3>Values, not hidden sharing</h3>
				<p>
					Strings, arrays, maps, and structs are copied when you assign or pass them, so changing a
					copy never changes the original. When you do want to share, you say so with a pointer, and
					the type shows it.
				</p>
				<a class="text-link" href="/docs/language/functions/#section-value-semantics">
					How values are passed →
				</a>
			</div>
			<div class="why-column">
				<h3>No garbage collector</h3>
				<p>
					Each value owns its memory, and the compiler releases it when the value goes out of scope.
					There are no collection pauses and no reference counting. Heap allocations made with
					<code>new</code> are yours to <code>free</code>.
				</p>
				<a class="text-link" href="/docs/language/memory/">How memory works →</a>
			</div>
			<div class="why-column">
				<h3>Close to the machine</h3>
				<p>
					Ocean compiles to native code through LLVM for Linux, macOS, and Windows, or to
					WebAssembly. Call C libraries directly with <code>extern</code>, and drop into inline
					assembly when you need a specific instruction.
				</p>
				<a class="text-link" href="/docs/language/c-interop/">C interop and assembly →</a>
			</div>
		</div>
	</section>

	<section class="section example-section">
		<div class="example-intro">
			<h2>A few examples</h2>
			<p>Take a look at the syntax, how arrays behave, and a simple generic type.</p>
			<div class="example-tabs" role="tablist" aria-label="Code examples">
				{#each examples as example, i}
					<button
						id={'example-tab-' + i}
						aria-controls="example-panel"
						role="tab"
						aria-selected={selected === i}
						class:selected={selected === i}
						onclick={() => (selected = i)}
					>
						<span>{example.title}</span>
						<span aria-hidden="true">→</span>
					</button>
				{/each}
			</div>
			<a class="text-link" href="/docs/language/basics/">Explore the language guide →</a>
		</div>
		<div
			id="example-panel"
			class="example-panel"
			role="tabpanel"
			aria-labelledby={'example-tab-' + selected}
		>
			<Code code={examples[selected].code} label={examples[selected].file} />
			<div class="example-output">
				<span>OUTPUT</span>
				<pre>{examples[selected].output}</pre>
			</div>
			<p>{examples[selected].explanation}</p>
		</div>
	</section>

	<section class="section journey">
		<div class="section-heading">
			<h2>Documentation</h2>
		</div>
		<div class="journey-grid">
			<a class="journey-main" href="/docs/getting-started/">
				<h3>Install Ocean</h3>
				<p>Download the installer or build from source, then compile your first program.</p>
				<span class="text-link">Installation and first steps <span>→</span></span>
			</a>
			<div class="journey-links">
				<a href="/docs/language/variables/">
					<div>
						<h3>Language guide</h3>
						<p>Variables, functions, collections, types, and memory.</p>
					</div>
					<span aria-hidden="true">→</span>
				</a>
				<a href="/docs/tooling/cli/">
					<div>
						<h3>Compiler and packages</h3>
						<p>Command-line usage, modules, and editor configuration.</p>
					</div>
					<span aria-hidden="true">→</span>
				</a>
				<a href="/docs/library/io/">
					<div>
						<h3>Standard library</h3>
						<p>
							Text, files and directories, formatting, JSON, HTTP, processes, terminal apps,
							threads, and more.
						</p>
					</div>
					<span aria-hidden="true">→</span>
				</a>
			</div>
		</div>
		<div class="development-note">
			<h3>Development status</h3>
			<p>
				Ocean is young and still changing. Expect rough edges and a small standard library. Follow
				development or contribute on
				<a href="https://github.com/ocean-foundation/ocean-c" target="_blank" rel="noopener noreferrer">
					GitHub ↗
				</a>.
			</p>
		</div>
	</section>
</main>

<style>
	.masthead {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 28px 48px;
		padding-block: 80px 76px;
	}

	.masthead h1 :global(.wordmark) {
		display: block;
		height: clamp(34px, 4.2vw, 48px);
		width: auto;
	}

	.slogan {
		font-size: 19px;
		line-height: 1.55;
		color: var(--muted);
		margin-top: 14px;
		max-width: 600px;
	}

	.get-started {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 14px 28px;
		border-radius: 6px;
		background: var(--accent);
		color: var(--bg);
		font-size: 16px;
		font-weight: 600;
		transition: opacity 0.15s;
	}

	.get-started:hover {
		opacity: 0.9;
	}

	.language-section {
		border-top: 1px solid var(--line);
	}

	.language-section h2 {
		font-size: 30px;
		line-height: 1.25;
		letter-spacing: -0.02em;
		font-weight: 600;
	}

	.why-columns {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 44px;
		margin-top: 36px;
	}

	.why-column {
		display: flex;
		flex-direction: column;
	}

	.why-column h3 {
		font-size: 17px;
		font-weight: 600;
		line-height: 1.35;
	}

	.why-column p {
		color: var(--muted);
		font-size: 15px;
		line-height: 1.75;
		margin-top: 12px;
	}

	.why-column code {
		font-family: 'IBM Plex Mono', monospace;
		font-size: 0.88em;
		color: var(--text);
	}

	.why-column .text-link {
		margin-top: auto;
		padding-top: 18px;
	}

	@media (max-width: 1100px) {
		.why-columns {
			gap: 32px;
		}
	}

	@media (max-width: 760px) {
		.masthead {
			padding-block: 48px 44px;
		}

		.slogan {
			font-size: 16px;
		}

		.get-started {
			width: 100%;
			justify-content: center;
		}

		.language-section h2 {
			font-size: 26px;
		}

		.why-columns {
			grid-template-columns: 1fr;
			gap: 32px;
			margin-top: 28px;
		}
	}
</style>
