// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface RenderJson {
		(json: any): HTMLElement;
		set_icons(show: string, hide: string): RenderJson;
		set_show_to_level(level: number | 'all'): RenderJson;
		set_max_string_length(length: number | 'none'): RenderJson;
		set_sort_objects(sort_bool: boolean): RenderJson;
		set_show_by_default(show: boolean): RenderJson;
		show_to_level: number;
		max_string_length: number;
		sort_objects: boolean;
		show: string;
		hide: string;
	}

	const renderjson: RenderJson;
}

export {};
