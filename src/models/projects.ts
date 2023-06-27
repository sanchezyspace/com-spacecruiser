import { fetchProjects } from '../adapters/notion-adapter'
import { Project } from './project'

export class Projects {
  projects: Project[]

  constructor() {
    this.projects = []
  }

  setProjects(projects: Project[]) {
    this.projects = projects
  }

  getProjects() {
    return this.projects
  }

  getProjectByName(name: string) {
    return this.projects.find((project) => project.name === name)
  }

  getProjectByProjectMessageId(projectMessageId: string) {
    return this.projects.find(
      (project) => project.discordProjectMessageId === projectMessageId
    )
  }

  async fetchProjects() {
    this.projects = await fetchProjects()
    return this.projects
  }
}
