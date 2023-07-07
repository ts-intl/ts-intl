import { writeJsonFile } from '../fs';
import { Project } from '../project';

// FIXME: split line
writeJsonFile(Project.getConfigFilePaths().project, Project.getProjectConfig());
