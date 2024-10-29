export interface IGetMarkdownResponse {
  markdown: { markdown_id: number; markdown_type_id: number; data: string; participated: string };
}
export interface IMarkdownFilterObject {
  typeName: string;
}

export interface MarkdownScoreObject {
  markdownId: number;
  score: number;
}
