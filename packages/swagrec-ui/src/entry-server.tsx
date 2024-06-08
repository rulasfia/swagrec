// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
	<StartServer
		document={({ assets, children, scripts }) => (
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<link rel="icon" href="/favicon.ico" />
					<link rel="preconnect" href="https://rsms.me/" />
					<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
					<title>Swagrec | Swagger Regenerator</title>
					{assets}
				</head>
				<body class="antialiased scroll-smooth caret-orange-600 accent-orange-600 bg-neutral-800 text-neutral-50">
					<div id="app">{children}</div>
					{scripts}
				</body>
			</html>
		)}
	/>
));
