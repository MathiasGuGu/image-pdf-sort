<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { getFileContext } from '$lib/fileContext.svelte';
	import SortableImage from '$lib/components/SortableImage.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { ArrowLeft, FileCheck, LoaderCircle } from 'lucide-svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import jsPDF from 'jspdf';

	const fileContext = getFileContext();

	console.log(fileContext.files);

	onMount(() => {
		if (!fileContext || fileContext.files.length === 0) {
			goto('/');
		}
	});

	let orderToImageMap = new SvelteMap<number, number>();

	let isExporting = $state(false);

	function getCurrentOrder(imageIndex: number): number | null {
		for (const [order, imgIndex] of orderToImageMap.entries()) {
			if (imgIndex === imageIndex) {
				return order;
			}
		}
		return null;
	}

	function handleOrderSelect(imageIndex: number, orderNumber: number) {
		const currentOrder = getCurrentOrder(imageIndex);
		if (currentOrder !== null) {
			orderToImageMap.delete(currentOrder);
		}

		orderToImageMap.set(orderNumber, imageIndex);
	}

	function isOrderComplete(): boolean {
		return orderToImageMap.size === fileContext.files.length;
	}

	async function handleExport() {
		if (isExporting) return;

		isExporting = true;

		try {
			const pdf = new jsPDF();

			const orderedFiles: File[] = [];

			const sortedEntries = Array.from(orderToImageMap.entries()).sort((a, b) => a[0] - b[0]);

			for (const [, fileIndex] of sortedEntries) {
				orderedFiles.push(fileContext.files[fileIndex]);
			}

			for (let i = 0; i < orderedFiles.length; i++) {
				const file = orderedFiles[i];

				if (i > 0) {
					pdf.addPage();
				}

				const imageUrl = URL.createObjectURL(file);

				const img = new Image();
				img.src = imageUrl;

				await new Promise((resolve, reject) => {
					img.onload = resolve;
					img.onerror = reject;
				});

				const pdfWidth = pdf.internal.pageSize.getWidth();
				const pdfHeight = pdf.internal.pageSize.getHeight();
				const margin = 5;

				const availableWidth = pdfWidth - margin * 2;
				const availableHeight = pdfHeight - margin * 2;

				const imgAspectRatio = img.width / img.height;

				let finalWidth, finalHeight;

				if (imgAspectRatio < 1) {
					finalHeight = availableHeight;
					finalWidth = availableHeight * imgAspectRatio;
				} else {
					finalWidth = availableWidth;
					finalHeight = availableWidth / imgAspectRatio;
				}

				const x = (pdfWidth - finalWidth) / 2;
				const y = (pdfHeight - finalHeight) / 2;

				const canvas = document.createElement('canvas');
				const ctx = canvas.getContext('2d');
				if (!ctx) {
					throw new Error('Failed to get canvas context');
				}
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const imageData = canvas.toDataURL('image/jpeg', 0.95);
				pdf.addImage(imageData, 'JPEG', x, y, finalWidth, finalHeight);

				pdf.setFontSize(10);
				pdf.text(`Page ${i + 1} of ${orderedFiles.length}`, pdfWidth / 2, pdfHeight - 10, {
					align: 'center'
				});

				URL.revokeObjectURL(imageUrl);
			}

			const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
			pdf.save(`sorted-images-${timestamp}.pdf`);
		} catch (error) {
			console.error('Error generating PDF:', error);
			alert('Failed to generate PDF. Please try again.');
		} finally {
			isExporting = false;
		}
	}
</script>

<main class="flex min-h-screen w-screen flex-col items-center gap-8 px-4 py-8">
	<header class="flex w-full max-w-4xl items-center justify-between">
		<Button variant="outline" onclick={() => goto('/')}>
			<ArrowLeft class="mr-2" size={20} />
			Back
		</Button>

		<h1 class="text-2xl font-bold">Sort Your Documents</h1>

		<Button disabled={!isOrderComplete() || isExporting} onclick={handleExport}>
			{#if isExporting}
				<LoaderCircle class="mr-2 animate-spin" size={20} />
				Generating PDF...
			{:else}
				<FileCheck class="mr-2" size={20} />
				Export as PDF
			{/if}
		</Button>
	</header>

	<section class="flex w-full max-w-4xl flex-col gap-2 text-center">
		<p class="text-lg text-zinc-600">
			Hover over each image to assign its position in the final document
		</p>
		<p class="text-sm text-zinc-500">
			{orderToImageMap.size} of {fileContext.files.length} images ordered
		</p>
	</section>

	<section class="flex w-full flex-col items-center gap-8 overflow-x-auto pb-12">
		<div class="flex w-full flex-col gap-8 px-4 py-4">
			{#each fileContext.files as file, index (file.name + index)}
				<SortableImage
					{file}
					{index}
					totalImages={fileContext.files.length}
					currentOrder={getCurrentOrder(index)}
					orderMap={orderToImageMap}
					onOrderSelect={handleOrderSelect}
				/>
			{/each}
		</div>
	</section>
</main>
