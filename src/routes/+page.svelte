<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import FileUpload from '$lib/components/FileUpload.svelte';
	import { ArrowRight } from 'lucide-svelte';
	import { getFileContext } from '$lib/fileContext.svelte';

	const fc = getFileContext();
</script>

<main class="flex h-screen w-screen flex-col items-center justify-center gap-12">
	<section class="flex flex-col items-center gap-2">
		<h1 class="max-w-3xl text-center text-2xl font-bold text-balance">
			Group your images into a sorted collection and export as PDF
		</h1>
		<p class="text-lg text-zinc-600">
			Select a handfull of images, choose the order, export as PDF
		</p>
	</section>
	<section class="flex w-full max-w-3xl flex-col items-center justify-center gap-4 px-4">
		<FileUpload />
		<Button disabled={fc.files.length === 0} onclick={() => goto('/sort')}
			>Sort document order <ArrowRight /></Button
		>
	</section>
</main>
