/* eslint-disable import/no-named-as-default */
import { describe, expect, it } from "vitest";

import meta from "../src/index";
import type { Options } from "vite-plugin-md";
import { composeFixture } from "./utils";

describe('use "meta" builder for frontmatterPreprocess', async () => {
  it("with no config, doc props all available as frontmatter props and other meta props get default mapping", async () => {
    const sfc = await composeFixture("meta", { builders: [meta() as any] });

    expect(sfc.frontmatter.title).toEqual("Metadata Rules");
    expect(sfc.frontmatter.byline).toEqual("who loves ya baby?");
    expect(sfc.frontmatter.layout).toEqual("yowza");
    expect(sfc.frontmatter.image).toEqual("facebook.png");

    expect(sfc.head.title).toEqual("Metadata Rules");
    expect(sfc.routeMeta?.meta?.layout).toEqual("yowza");
    expect(sfc.meta.find((p) => p.key === "title")).toBeDefined();
    expect(sfc.meta.find((p) => p.key === "image")).toBeDefined();
  });

  it("default value is used when no frontmatter is present", async () => {
    const options: Options = {
      frontmatterDefaults: {
        title: "nada",
        description: "there I was, there I was",
      },
      builders: [meta() as any],
    };
    const sfc = await composeFixture("meta", options);

    expect(
      sfc.frontmatter.title,
      "default value should have been ignored in favor of page value"
    ).toBe("Metadata Rules");

    expect(
      sfc.frontmatter.description,
      `default value should have presented, found: ${sfc.frontmatter}`
    ).toBe("there I was, there I was");

    expect(
      sfc.meta.find((i) => i.key === "description"),
      "description, as a default value, should now be in meta props"
    ).toBeDefined();
  });

  it("frontmatter props exported", async () => {
    const { component } = await composeFixture("meta");

    expect(component.includes("const title")).toBeTruthy();
    expect(component.includes("const byline")).toBeTruthy();
    expect(component.includes("const layout")).toBeTruthy();
    expect(component.includes("const image")).toBeTruthy();

    expect(component.includes("const frontmatter")).toBeTruthy();
    expect(component.includes("export const frontmatter")).toBeTruthy();
    expect(component.includes("defineExpose({ ")).toBeTruthy();
  });
});

describe("meta() as any can manage route meta", () => {
  it("router not brought into script section when Markdown doesn't have route meta", async () => {
    const { scriptSetup } = await composeFixture("simple", {
      builders: [meta() as any],
    });

    expect(scriptSetup).not.toContain("useRouter");
  });

  it("router IS imported when a a 'route prop' is defined in frontmatter", async () => {
    const { scriptSetup, frontmatter } = await composeFixture("meta", {
      builders: [meta() as any],
    });
    expect(frontmatter.layout).toBeDefined();
    expect(scriptSetup).toContain("useRouter");
  });

  it("using routeName callback ensures that router is imported and route name is set", async () => {
    const { frontmatter, scriptSetup } = await composeFixture("no-route", {
      builders: [
        meta({
          routeName: (filename, fm) =>
            fm.title ? `bespoke-${fm.title}` : "nada",
        }) as any,
      ],
    });

    expect(frontmatter.title).toBe("NoRoute");
    expect(
      scriptSetup,
      "should have included an import of useRouter!"
    ).toContain("useRouter");
    expect(
      scriptSetup,
      `The scriptSetup block was:\n${scriptSetup}\n\n`
    ).toContain('router.currentRoute.value.name = "bespoke-NoRoute"');
  });
});

describe("meta() as any snapshots", async () => {
  it("frontmatter is consistent", async () => {
    const sfc = await composeFixture("meta", { builders: [meta() as any] });

    expect(sfc.frontmatter).toMatchSnapshot();
  });

  it("HTML is consistent", async () => {
    const sfc = await composeFixture("meta", { builders: [meta() as any] });

    expect(sfc.html).toMatchSnapshot();
  });

  it("script blocks are consistent", async () => {
    const sfc = await composeFixture("meta", { builders: [meta() as any] });

    expect(sfc.scriptBlocks).toMatchSnapshot();
  });

  it("custom blocks are consistent", async () => {
    const sfc = await composeFixture("meta", { builders: [meta() as any] });

    expect(sfc.customBlocks).toMatchSnapshot();
  });
});
