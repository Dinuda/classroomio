export type CourseType = 'paced' | 'live';

export type CourseFilterItem = {
  title: string;
  type: CourseType;
  checked: boolean;
};

export type Course = {
  title: string;
  description: string;
  banner: string;
  created_at: string;
  cost: string;
  currency: string;
  type: string;
  slug: string;
  lessonsCount: number;
  sections: Section[];
};

export type Section = {
  title: string;
  sectionSlug: string;
  published: boolean;
  children: {
    title: string;
    filename: string;
  }[];
};

export type Lesson = {
  title: string;
  position: number;
  filename: string;
};