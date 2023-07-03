import { getDefaultProjectConfig, getProjectConfigPaths } from '../project';
import { writeJsonFile } from '../utils';

writeJsonFile(getProjectConfigPaths().project, getDefaultProjectConfig());
