import type { Course, Section } from '$lib/utils/types/course';
import { redirect } from '@sveltejs/kit';
import type { PathLike } from 'fs';
import fs from 'fs/promises'; // Use async fs functions
import path from 'path';

export const load = async ({ params }) => {
  const slug = params.slug || '';

  const courseDirPath = path.join(process.cwd(), `src/courses/${slug}`);

  // Path to the metadata.json file for the course
  const courseFilePath = path.join(courseDirPath, 'metadata.json');

  console.time('Loading course data');

  // Read metadata.json asynchronously
  const course: Course = JSON.parse(await fs.readFile(courseFilePath, 'utf-8'));

  // Get all sections (directories) within the course directory asynchronously
  const sections = (await fs.readdir(courseDirPath, { withFileTypes: true }))
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const lessonsBySection: Section[] = await Promise.all(
    sections.map(async (section) => {
      const sectionDirPath = path.join(courseDirPath, section);

      // Get all markdown files in the section directory asynchronously
      const lessonFiles = (await fs.readdir(sectionDirPath)).filter((file) => file.endsWith('.md'));

      // Extract title and position from each lesson's front matter
      const lessons = await Promise.all(
        lessonFiles.map(async (lessonFile) => {
          const lessonFilePath = path.join(sectionDirPath, lessonFile);
          const lessonContent = await fs.readFile(lessonFilePath, 'utf-8');

          // Regex to extract the front matter block (optimize front matter extraction)
          const frontMatterMatch = lessonContent.match(/---\s*([\s\S]+?)\s*---/);

          let title = lessonFile.replace('.md', ''); // Default title from filename

          if (frontMatterMatch) {
            const frontMatter = frontMatterMatch[1];

            // Extract title and position from the front matter
            const titleMatch = frontMatter.match(/title:\s*['"](.+?)['"]/);

            if (titleMatch) {
              title = titleMatch[1].trim();
            }
          }

          return { title, filename: lessonFile };
        })
      );

      // Add section title and published status from section metadata (if available)
      const sectionMetadataPath = path.join(sectionDirPath, 'metadata.json');
      let sectionMetadata = { title: section, unlocked: true };

      if (await fileExists(sectionMetadataPath)) {
        sectionMetadata = JSON.parse(await fs.readFile(sectionMetadataPath, 'utf-8'));
      }

      // Add the section and its sorted lessons to the result
      return {
        title: sectionMetadata.title,
        sectionSlug: section,
        published: sectionMetadata.unlocked,
        children: lessons // Extra details like position and filename
      };
    })
  );
  console.timeEnd('Loading course data'); // End timing

  if (!params.section) {
    redirectToFirstLesson(lessonsBySection, slug);
  }

  return { ...course, sections: lessonsBySection, slug };
};

function redirectToFirstLesson(sections: Section[], slug: string) {
  const firstSection = sections[0];
  const firstLesson = firstSection.children[0];

  if (!firstSection || !firstLesson) {
    throw new Error('No course content found');
  }

  redirect(302, `/course/${slug}/${firstSection.sectionSlug}/${firstLesson.filename}`);
}

const fileExists = async (filePath: PathLike) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};