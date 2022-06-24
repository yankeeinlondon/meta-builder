import { Pipeline, PipelineStage } from "vite-plugin-md";

export type MetaFlag = [prop: string, defVal: boolean];
export type ReturnValues = string | string[] | number | boolean | Object;

export type HeadProperties = "title"
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
  frontmatter: Pipeline<PipelineStage.parser>["frontmatter"]
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
  routeProps: string[];

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
   * Properties in frontmatter dictionary which will be treated as HEAD properties
   * when discovered in documents
   *
   * @default ['title']
   */
  headProps: HeadProperties[];

  /**
   * If turned on, this will ensure that all query parameters on the given route
   * are made available under the `queryParams` variable.
   *
   * @default false
   */
  queryParameters: Boolean;
}