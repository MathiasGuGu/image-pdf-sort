<script lang="ts">
	import Button from './ui/button/button.svelte';

	interface Props {
		file: File;
		index: number;
		totalImages: number;
		currentOrder: number | null;
		orderMap: Map<number, number>;
		onOrderSelect: (imageIndex: number, orderNumber: number) => void;
	}

	let { file, index, totalImages, currentOrder, orderMap, onOrderSelect }: Props = $props();

	let imageUrl = $derived(URL.createObjectURL(file));

	function isOrderTaken(orderNum: number): boolean {
		return orderMap.has(orderNum) && orderMap.get(orderNum) !== index;
	}

	function isCurrentOrder(orderNum: number): boolean {
		return currentOrder === orderNum;
	}
</script>

<div
	class="relative flex flex-col items-center gap-3"
	role="button"
	tabindex="0"
>
	<div
		class="relative h-auto w-[50%] overflow-hidden rounded-lg border-2 border-zinc-200 bg-zinc-100 shadow-md"
	>
		<img src={imageUrl} alt={file.name} class="h-full w-full object-contain" />

		{#if currentOrder !== null}
			<div
				class="absolute top-4 left-4 flex size-12 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-lg"
			>
				{currentOrder}
			</div>
		{/if}
	</div>

	<p class="w-80 truncate text-sm text-zinc-600" title={file.name}>
		{file.name}
	</p>

	<div
		class="absolute right-1/5 flex flex-col justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 shadow-lg"
	>
		{#each Array.from({ length: totalImages }, (_, i) => i + 1) as orderNum (orderNum)}
			<Button
				variant="outline"
				type="button"
				class="size-10 font-semibold transition-all {isCurrentOrder(orderNum)
					? 'border-blue-600 bg-blue-600 text-white'
					: isOrderTaken(orderNum)
						? 'border-amber-400 bg-amber-50 text-amber-700 hover:border-amber-500 hover:bg-amber-100'
						: ''}"
				onclick={() => onOrderSelect(index, orderNum)}
				title={isOrderTaken(orderNum) && !isCurrentOrder(orderNum)
					? `Already assigned to image ${orderMap.get(orderNum)! + 1}`
					: `Set as position ${orderNum}`}
			>
				{orderNum}
			</Button>
		{/each}
	</div>
</div>
