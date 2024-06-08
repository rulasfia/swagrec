import { ComponentProps } from "react";

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
	return (
		<textarea
			className={`w-full px-4 py-2 text-sm border border-neutral-600 bg-neutral-900 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400 focus:border-orange-400 transition duration-100 ease-in ${className}`}
			{...props}
		/>
	);
}
