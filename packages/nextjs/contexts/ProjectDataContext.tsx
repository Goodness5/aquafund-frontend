"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface ProjectData {
  projectId: string;
  title: string;
  description: string;
  images: string[];
  location: string;
  category: string;
  admin: string;
  creator: string;
  fundingGoal: string;
  fundsRaised: string;
  status: number;
  donorCount: number;
  donationCount: number;
  createdAt: string;
  updatedAt: string;
  projectAddress?: string;
}

interface ProjectDataContextType {
  projectCache: Map<string, ProjectData>;
  getProject: (projectId: string) => ProjectData | undefined;
  setProject: (projectId: string, data: ProjectData) => void;
  fetchProject: (projectId: string, projectAddress?: string) => Promise<ProjectData | null>;
  clearCache: () => void;
}

const ProjectDataContext = createContext<ProjectDataContextType | undefined>(undefined);

export function ProjectDataProvider({ children }: { children: ReactNode }) {
  const [projectCache, setProjectCache] = useState<Map<string, ProjectData>>(new Map());

  const getProject = useCallback((projectId: string) => {
    return projectCache.get(projectId);
  }, [projectCache]);

  const setProject = useCallback((projectId: string, data: ProjectData) => {
    setProjectCache((prev) => {
      const newCache = new Map(prev);
      newCache.set(projectId, data);
      return newCache;
    });
  }, []);

  const fetchProject = useCallback(async (projectId: string, projectAddress?: string): Promise<ProjectData | null> => {
    // Check cache first
    const cached = projectCache.get(projectId);
    if (cached) {
      return cached;
    }

    try {
      const url = projectAddress
        ? `/api/projects/details?projectId=${projectId}&projectAddress=${projectAddress}`
        : `/api/projects/details?projectId=${projectId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch project: ${response.statusText}`);
      }

      const result = await response.json();
      
      // Get project address if not provided
      let projectAddr = projectAddress;
      if (!projectAddr) {
        try {
          const addrResponse = await fetch(`/api/projects/address?projectId=${projectId}`);
          if (addrResponse.ok) {
            const addrData = await addrResponse.json();
            projectAddr = addrData.address;
          }
        } catch (err) {
          console.warn("Could not fetch project address:", err);
        }
      }
      
      const projectData: ProjectData = {
        projectId: result.info.projectId,
        title: result.info.title || "N/A",
        description: result.info.description || "N/A",
        images: result.info.images || [],
        location: result.info.location || "N/A",
        category: result.info.category || "N/A",
        admin: result.info.admin,
        creator: result.info.creator,
        fundingGoal: result.info.fundingGoal,
        fundsRaised: result.info.fundsRaised,
        status: result.info.status,
        donorCount: result.donorCount || 0,
        donationCount: result.donationCount || 0,
        createdAt: result.info.createdAt,
        updatedAt: result.info.updatedAt,
        projectAddress: projectAddr,
      };

      // Cache the data
      setProject(projectId, projectData);
      return projectData;
    } catch (error) {
      console.error("Error fetching project:", error);
      return null;
    }
  }, [projectCache, setProject]);

  const clearCache = useCallback(() => {
    setProjectCache(new Map());
  }, []);

  return (
    <ProjectDataContext.Provider
      value={{
        projectCache,
        getProject,
        setProject,
        fetchProject,
        clearCache,
      }}
    >
      {children}
    </ProjectDataContext.Provider>
  );
}

export function useProjectData() {
  const context = useContext(ProjectDataContext);
  if (context === undefined) {
    throw new Error("useProjectData must be used within a ProjectDataProvider");
  }
  return context;
}

