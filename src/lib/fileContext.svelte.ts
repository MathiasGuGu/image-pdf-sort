import { setContext, getContext } from 'svelte';

export class FileContext {
	private _files = $state<File[]>([]);

	get files() {
		return this._files;
	}

	addFiles(newFiles: FileList | null) {
		if (newFiles) {
			this._files = [...this._files, ...Array.from(newFiles)];
		}
	}

	removeFile(index: number) {
		this._files = this._files.filter((_, i) => i !== index);
	}

	clearFiles() {
		this._files = [];
	}
}

export function createFileContext() {
	const context = new FileContext();
	setContext('fileContext', context);
	return context;
}

export function getFileContext(): FileContext {
	return getContext('fileContext');
}
