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

  async fetchProjects() {
    this.projects = await fetchProjects()
    return this.projects
  }
}
