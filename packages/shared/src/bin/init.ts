import { writeJsonFile } from '../fs';
import { Project } from '../project';

writeJsonFile(
  Project.getConfigFilePaths().project,
  Project.getDefaultProjectConfig(),
  false
);
