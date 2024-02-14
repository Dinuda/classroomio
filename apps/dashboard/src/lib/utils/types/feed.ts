export interface Author {
  id: string;
  username: string;
  fullname: string;
  avatar: string;
}

export interface Comment {
  id: string;
  created_at: string;
  content: string;
  author: Author;
}

export interface Reaction {
  smile: string[];
  thumbsup: string[];
  thumbsdown: string[];
  clap: string[];
}

export interface Feed {
  id: string;
  content: string;
  author: Author;
  created_at: string;
  comment: Comment[];
  reaction: Reaction[];
}