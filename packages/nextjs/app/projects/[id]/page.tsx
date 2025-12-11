"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProjectData } from "~~/contexts/ProjectDataContext";
import { createSlug } from "~~/utils/slug";

/**
 * Redirect page for old /projects/[id] URLs
 * Fetches project data and redirects to /projects/[id]/[slug]
 */
export default function ProjectDetailRedirect() {
  const params = useParams();
  const router = useRouter();
  const { fetchProject } = useProjectData();
  const idParam = params?.id as string;

  useEffect(() => {
    const redirect = async () => {
      if (!idParam) {
        router.push("/projects");
        return;
      }

      // Fetch project to get title for slug
      const projectData = await fetchProject(idParam);
      
      if (projectData) {
        const slug = createSlug(projectData.title);
        router.replace(`/projects/${idParam}/${slug}`);
      } else {
        // Project not found, redirect to projects list
        router.push("/projects");
      }
    };

    redirect();
  }, [idParam, fetchProject, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center text-[#475068]">Redirecting...</div>
    </div>
  );
}
