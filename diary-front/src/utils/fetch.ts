import 'isomorphic-fetch';

export default (url: string, opt: any) => {
  return fetch(url, opt)
}
