import { Suggest } from "inferred-types";
import { Pipeline } from "vite-plugin-md";

export type MetaFlag = [prop: string, defVal: boolean];
export type ReturnValues = string | string[] | number | boolean | Object;

export type HeadProperties =
  | "title"
  | "link"
  | "base"
  | "style"
  | "script"
  | "htmlAttrs"
  | "bodyAttrs";

/**
 * A callback for meta-builder callbacks
 */
export type MetaCallback<T extends ReturnValues> = (
  filename: string,
  frontmatter: Pipeline<"parser">["frontmatter"]
) => T;

/** configuration options for the `meta-builder` extension */
export interface MetaOptions {
  /**
   * Properties in frontmatter dictionary which will be treated as "meta" properties
   * when discovered in documents
   *
   * @default [ 'title', 'description', 'image', 'url', 'image_width', 'image_height' ]
   */
  metaProps: string[];

  /**
   * Properties in frontmatter dictionary which will be treated as "route meta" properties
   * when discovered in documents
   *
   * @default ['layout']
   */
  routeMetaProps: string[];

  /**
   * Allows the user to configure a bespoke scheme for setting a page's route path.
   * By default the path is simply a direct artifact of the filename and directory.
   */
  routePath?: string | MetaCallback<string>;

  /**
   * This defines the name of the _frontmatter property_ which will map to the
   * route's "name". If this property is set in a page's frontmatter then the page
   * will import Vue Router to set the name.
   *
   * **Note:** if you want a callback function to set the name instead of a frontmatter property
   * then use the `routeName` callback instead.
   *
   * @default "routeName"
   */
  routeNameProp?: string | false;

  /**
   * By default the "meta tags" are just inserted into the HEAD section of the page
   * but if you want their name/value pairs being exposed as frontmatter props too
   * then you can add them to a property name of your choosing but be sure choose
   * a name that will avoid conflicts with page authors.
   */
  addMetaTagsToFrontmatter?: false | Suggest<"_meta_tags">;

  /**
   * Allows you to pass in a callback function which will receive both the _filename_ and
   * the _frontmatter_ on the page to allow your callback to decide what the name for the
   * route should be.
   *
   * Note: return `false` if you don't want the page to be a named route. Also, if you prefer
   * a simple frontmatter property to name mapping you can instead use the `routeMetaProp`
   * option instead of this.
   */
  routeName?: MetaCallback<string | false>;

  /**
   * @deprecated setting this currently has no function
   */
  headProps?: HeadProperties[];

  /**
   * **titleProp**
   *
   * Allows you to express which property in the frontmatter
   * should be associated with the "title" of the page (aka, used
   * to create the `<title>...</title>` block in the HEAD).
   *
   * @default "title"
   */
  titleProp?: Suggest<"title">;

  /**
   * If turned on, this will ensure that all query parameters on the given route
   * are made available under the `queryParams` variable in frontmatter.
   *
   * @default false
   */
  queryParameters?: Boolean;
}
