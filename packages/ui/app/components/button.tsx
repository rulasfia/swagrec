import { ComponentProps } from "react";

export function Button({ className, ...props }: ComponentProps<"button">) {
	return (
		<button
			className={`w-fit px-4 py-2 text-sm font-medium text-white bg-orange-500 rounded-md shadow-sm hover:shadow-md focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-orange-300 focus:ring-orange-400 focus:border-orange-400 transition duration-100 ease-in ${className}`}
			{...props}
		/>
	);
}
