import { notFound } from "next/navigation";
import { CourseDetail } from "@/components/app/student/course-detail";
import { courseBySlug, courses } from "@/lib/data";

export function generateStaticParams() {
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/student/studio/[slug]">) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  return {
    title: course
      ? `${course.title} · Ednovate Labs`
      : "Course not found · Ednovate Labs",
  };
}

export default async function CoursePage({
  params,
}: PageProps<"/student/studio/[slug]">) {
  const { slug } = await params;
  const course = courseBySlug(slug);
  if (!course) notFound();
  return <CourseDetail course={course} />;
}
