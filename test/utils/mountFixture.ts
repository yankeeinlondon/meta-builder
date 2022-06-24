import { mount } from "@vue/test-utils";
import type { DefineComponent } from "vue";
import type { Frontmatter } from "vite-plugin-md";

async function importFixture(fixture: string) {
  const assets = (await import(fixture)) as {
    default: DefineComponent;
    frontmatter: Frontmatter;
    excerpt?: string;
  };
  return {
    frontmatter: assets.frontmatter,
    component: assets.default,
    excerpt: assets.excerpt,
  };
}

/**
 * attempts to asynchronously import the Markdown file and returns
 * the `frontmatter` and `component`; it also provides the `sfc` object
 * for comparison purposes to aid in testing.
 */
export const mountFixture = async (fixture: string) => {
  try {
    // const sfc = await composeFixture(fixture)
    const assets = await importFixture(fixture);
    const wrapper = mount(assets.component, { global: { plugins: [] } });
    return {
      ...assets,
      wrapper,
    };
  } catch (error) {
    throw new Error(`Problem mounting "${fixture}" into DOM. The markdown of the file was:\n: ${error instanceof Error ? error.message : String(error)}`);
  }
};

