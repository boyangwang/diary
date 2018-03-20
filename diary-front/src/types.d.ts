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

declare module 'classnames' {
  export default function classnames(arg1: any, arg2: any): string;
}
