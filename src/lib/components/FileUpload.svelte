<script lang="ts">
	import { Upload } from 'lucide-svelte';
	import { getFileContext } from '$lib/fileContext.svelte';

	const fileContext = getFileContext();

	let isDragging = $state(false);
	let fileInput: HTMLInputElement;

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			fileContext.addFiles(target.files);
		}
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;

		if (event.dataTransfer?.files) {
			fileContext.addFiles(event.dataTransfer.files);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function openFileDialog() {
		fileInput.click();
	}

	function getImagePreview(file: File): string {
		return URL.createObjectURL(file);
	}

	function removeFile(index: number) {
		fileContext.removeFile(index);
	}
</script>

<div class="flex w-full flex-col gap-4">
	<button
		type="button"
		class="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed transition-colors {isDragging
			? 'border-blue-500 bg-blue-50'
			: 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-zinc-100'}"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		onclick={openFileDialog}
	>
		<div
			class="flex size-16 items-center justify-center rounded-full {isDragging
				? 'bg-blue-100'
				: 'bg-zinc-200'}"
		>
			<Upload class={isDragging ? 'text-blue-600' : 'text-zinc-600'} size={32} />
		</div>

		<div class="flex flex-col items-center gap-1">
			<p class="text-lg font-semibold text-zinc-700">
				{isDragging ? 'Drop your images here' : 'Click to upload or drag and drop'}
			</p>
			<p class="text-sm text-zinc-500">PNG, JPG, GIF up to 10MB</p>
		</div>

		<input
			bind:this={fileInput}
			type="file"
			multiple
			accept="image/*"
			class="hidden"
			onchange={handleFileSelect}
		/>
	</button>

	{#if fileContext.files.length > 0}
		<div class="grid grid-cols-[repeat(auto-fill,minmax(80px,1fr))] gap-4">
			{#each fileContext.files as file, index (file.name + index)}
				<div class="group relative">
					<div
						class="aspect-square w-full overflow-hidden rounded-lg border-2 border-zinc-200 bg-zinc-100"
					>
						<img src={getImagePreview(file)} alt={file.name} class="size-full object-cover" />
					</div>

					<button
						type="button"
						class="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-red-600"
						onclick={() => removeFile(index)}
						aria-label="Remove {file.name}"
					>
						<span class="text-sm font-bold">×</span>
					</button>

					<p class="mt-1 truncate text-xs text-zinc-600" title={file.name}>
						{file.name}
					</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
