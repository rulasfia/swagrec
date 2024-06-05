// import { createSignal } from "solid-js";

import { parse, string, url } from "valibot";

/**
 * Parse data from a remote URL to JS Object.
 *
 * @param {string} input_url - the URL to parse data from
 */
export function parse_from_remote_url(input_url: string) {
  const url_arg = parse(string([url()]), input_url);

  return fetch(url_arg);
}

function HomePage() {
  async function submitHandler(
    e: Event & {
      submitter: HTMLElement;
      currentTarget: HTMLFormElement;
      target: Element;
    },
  ) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const referenceUrl = formData.get("referenceUrl")?.toString();
    if (!referenceUrl) return;

    const parsed = await parse_from_remote_url(referenceUrl);
    console.log(referenceUrl, parsed);
  }

  return (
    <>
      <main class="container mx-auto mt-4 grid min-h-[calc(100vh-7rem)] grid-cols-2 gap-8">
        <section>
          {/* reference url input */}
          <form novalidate class="flex flex-col gap-2" onsubmit={submitHandler}>
            <label for="referenceUrl" class="text-sm font-medium">
              Reference URL
            </label>
            <div class="flex flex-row justify-between">
              <input
                type="text"
                id="referenceUrl"
                name="referenceUrl"
                class="focus-visible:ring-sky-500-500 relative inline-flex h-9 w-full items-center justify-start rounded-l-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
              />
              <button
                type="submit"
                class="inline-flex h-9 items-center justify-center rounded-r-md bg-sky-600 px-4 text-sm font-medium text-white hover:bg-sky-700"
              >
                Submit
              </button>
            </div>
          </form>
        </section>

        <section>
          {/* output file name input */}
          <div class="flex flex-col gap-2">
            <label for="outputFileName" class="text-sm font-medium">
              Output File Name
            </label>
            <input
              type="text"
              id="outputFileName"
              name="outputFileName"
              class="focus-visible:ring-sky-500-500 relative inline-flex h-9 items-center justify-start rounded-md border border-gray-300 px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1"
            />
          </div>
        </section>
      </main>
    </>
  );
}

export default HomePage;
