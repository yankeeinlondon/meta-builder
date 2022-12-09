import type {
  Frontmatter,
  MetaProperty,
  RouteConfig,
} from "@yankeeinlondon/builder-api";
import { createBuilder } from "@yankeeinlondon/builder-api";
import { keys, valueOrCallback } from "./utils";
import { MetaOptions } from "./types";

function addMetaTag(k: string, v: any): MetaProperty {
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
    let { frontmatter, meta, head, fileName } = p;
    const c: MetaOptions = {
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
      headProps: ["title"],

      ...o,
    };

    head = {
      ...head,
      ...Object.fromEntries(
        c?.headProps.map((p) => [p, frontmatter[p as string]])
      ),
    };

    meta = [
      ...meta,
      ...c.metaProps.reduce(
        (acc, p) =>
          frontmatter[p as string]
            ? [...acc, addMetaTag(p, frontmatter[p as string])]
            : acc,
        [] as MetaProperty[]
      ),
    ];

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

    return {
      ...p,
      head,
      meta,
      routeMeta: Object.keys(routeMeta).length > 0 ? routeMeta : undefined,
      frontmatter,
    };
  })
  .meta({
    description:
      "adds meta-tags to the HEAD of the page in a way that is easily digested by social media sites and search engines",
  });

const _f = meta({});
