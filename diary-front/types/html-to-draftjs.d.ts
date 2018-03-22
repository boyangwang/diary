declare module 'html-to-draftjs' {
  import { EditorState } from 'draft-js';
  const HtmlToDraft: (input: string) => EditorState;
  export default HtmlToDraft;
}
