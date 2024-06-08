import { Link } from "@remix-run/react";

export default function Header() {
	return (
		<div className="h-16 bg-orange-600 text-white flex flex-row items-center">
			<header className="container items-center sticky top-0 z-10 mx-auto flex flex-row justify-between">
				<div className="gap-4 flex flex-row items-center ">
					<Link to="/" className="text-2xl font-bold">
						Swagrec
					</Link>
					<span>|</span>
					<span className="opacity-90 text-sm">Swagger Regenerator</span>
				</div>
				<span>v0.0.1</span>
			</header>
		</div>
	);
}
