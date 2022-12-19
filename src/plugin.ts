/* eslint-disable unicorn/consistent-destructuring */
import type {
  Frontmatter,
  MetaProperty,
  RouteConfig,
} from "@yankeeinlondon/builder-api";
import { createBuilder } from "@yankeeinlondon/builder-api";
import { keys, valueOrCallback } from "./utils";
import { MetaOptions } from "./types";
import { isRef, Ref } from "vue";

type MaybeRef<T> = T | Ref<T>;

// utility fns for working MaybeRef types
const set = (p: MaybeRef<any>, v: any) => (isRef(p) ? (p.value = v) : (p = v));
function createMetaTag(k: string, v: any): MetaProperty {
  return {
    name: `twitter:${k}`,
    property: `og:${k}`,
    itemprop: k,
    key: k,
    content: v,
  };
}

export const meta = createBuilder("meta", "metaExtracted")
  .options<Partial<MetaOptions>>()
  .initializer()
  .handler(async (p, o) => {
    // eslint-disable-next-line prefer-const
    let { frontmatter, fileName, addMetaProperty } = p;
    const c = {
      metaProps: [
        "image",
        "title",
        "description",
        "url",
        "image_width",
        "image_height",
      ],
      routeMetaProps: ["layout", "requiresAuth"],
      routeNameProp: "routeName",
      queryParameters: false,
      titleProp: "title",

      ...o,
    } satisfies MetaOptions;

    /** array of meta tags */
    const meta = [
      ...c?.metaProps.reduce(
        (acc, p) =>
          frontmatter[p as string]
            ? [...acc, createMetaTag(p, frontmatter[p as string])]
            : acc,
        [] as MetaProperty[]
      ),
    ];
    // inject into payload
    meta.map((m) => addMetaProperty(m));
    // add meta into frontmatter if configured to do so
    if (o.addMetaTagsToFrontmatter) {
      frontmatter = {
        ...frontmatter,
        [o.addMetaTagsToFrontmatter]: meta,
      };
    }

    /** the route's meta properties */
    const routeMetaProps: Record<string, any> = c.routeMetaProps.reduce(
      (acc, p) =>
        p in frontmatter ? { ...acc, [p]: frontmatter[p as string] } : acc,
      {}
    );

    const routeName: string | false = c.routeName
      ? c.routeName(fileName, frontmatter)
      : typeof c.routeNameProp === "string"
      ? (frontmatter[c.routeNameProp] as string | undefined) || false
      : false;

    const routeMeta: RouteConfig = {
      ...p.routeMeta,
      ...(routeName ? { name: routeName } : {}),
      ...(c.routePath
        ? {
            path: valueOrCallback(c.routePath, [
              fileName,
              frontmatter,
            ]) as string,
          }
        : {}),
      ...(Object.keys(routeMetaProps).length > 0
        ? { meta: routeMetaProps }
        : {}),
    };
    const hasRouteConfig = Object.keys(routeMeta).length > 0 || routeName;

    // ROUTE META
    if (hasRouteConfig || o.queryParameters) {
      const router = ["import { useRouter, useRoute } from 'vue-router'"];
      if (o.queryParameters) {
        router.push(
          "const route = useRoute()",
          "const queryParams: Record<string, string|boolean|number> = route.query"
        );
      }

      if (hasRouteConfig) {
        router.push("const router = useRouter()");
        if (routeMeta.name) {
          router.push(
            `router.currentRoute.value.name = ${JSON.stringify(routeMeta.name)}`
          );
        }

        if (routeMeta.path) {
          router.push(
            `router.currentRoute.value.path = ${JSON.stringify(routeMeta.path)}`
          );
        }

        if (routeMeta.meta) {
          router.push(
            "router.currentRoute.value.meta = {",
            "  ...router.currentRoute.value.meta,"
          );

          for (const key of keys(routeMeta.meta)) {
            const value = (routeMeta.meta as Frontmatter)[key];
            if (
              !Array.isArray(value) &&
              value !== null &&
              typeof value === "object"
            ) {
              // a dictionary of key/values ... most typically associated to the "route" prop
              for (const subKey of keys(value as Object)) {
                const subValue = (
                  (routeMeta.meta as Frontmatter)[key] as Record<string, any>
                )[subKey];
                router.push(`  ${subKey}: ${JSON.stringify(subValue)},`);
              }
            } else {
              router.push(`  ${key}: ${JSON.stringify(value)},`);
            }
          }

          router.push("}");
        }
      }

      p.addCodeBlock("route-meta", router.join("\n"));
    }

    // set the title if available info present
    if (p.frontmatter && o.titleProp && frontmatter[o.titleProp]) {
      set(p.head.title, frontmatter[o.titleProp]);
    }

    return {
      ...p,
      meta,
      routeMeta: Object.keys(routeMeta).length > 0 ? routeMeta : undefined,
      frontmatter,
    };
  })
  .meta({
    description:
      "adds meta-tags to the HEAD of the page in a way that is easily digested by social media sites and search engines",
  });
