/* @refresh reload */
import { render } from "solid-js/web";
import { RouteDefinition, Router } from "@solidjs/router";

import "./index.css";
import Homepage from "./pages/_index";

const routes: RouteDefinition = {
  path: "/",
  component: Homepage,
};

render(
  () => (
    <>
      <header class="container mx-auto flex h-20 flex-row items-center justify-between border-b border-b-gray-300">
        <span class="text-xl font-semibold">Swagrec UI</span>
        <span>v0.0.1</span>
      </header>

      <Router>{routes}</Router>

      <footer class="container mx-auto flex h-8 flex-row items-center border-t border-t-gray-300 text-sm">
        <p>
          Made with ❤️ by{" "}
          <a href="https://github.com/rulasfia" target="_blank">
            rulasfia
          </a>
        </p>
      </footer>
    </>
  ),
  document.getElementById("root")!,
);
