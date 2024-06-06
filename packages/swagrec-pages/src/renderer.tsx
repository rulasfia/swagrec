import { jsxRenderer } from "hono/jsx-renderer";

export const renderer = jsxRenderer(({ children, title }) => {
	return (
		<html>
			<head>
				<link rel="preconnect" href="https://rsms.me/" />
				<link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
				<link href="/static/reset.css" rel="stylesheet" />
				<link href="/static/style.css" rel="stylesheet" />
				<title>{title}</title>
			</head>
			<body>
				<div class="header_container">
					<header>
						<div class="title">
							<a href="/">Swagrec</a>
							<span>Swagger Regenerator</span>
						</div>
						<span>v0.0.1</span>
					</header>
				</div>
				{children}
			</body>
			<script src="/static/script.js" type="module"></script>
		</html>
	);
});
