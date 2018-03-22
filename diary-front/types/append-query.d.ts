declare class AppendQueryOptions {
  encodeComponents?: boolean;
  removeNull?: boolean;
}

declare module 'append-query' {
  export default function appendQuery(
    url: string,
    params: object,
    options?: AppendQueryOptions
  ): string;
}
