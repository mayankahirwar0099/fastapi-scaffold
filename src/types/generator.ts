export interface ProjectConfig {
  projectName: string;
  description: string;
  includeDatabase: boolean;
  databaseType: 'sqlite' | 'postgresql';
  includeAuth: boolean;
  includeDocker: boolean;
  includePytest: boolean;
  includeCors: boolean;
  includeAsyncHandlers: boolean;
  pythonVersion: '3.11' | '3.12' | '3.10';
}

export interface GeneratedFile {
  name: string;
  path: string;
  language: 'python' | 'dockerfile' | 'yaml' | 'text' | 'markdown' | 'bash';
  content: string;
  description: string;
  badge?: string;
}

export interface EntityField {
  name: string;
  type: 'str' | 'int' | 'float' | 'bool' | 'datetime';
  nullable: boolean;
  isUnique?: boolean;
  defaultValue?: string;
  description?: string;
}

export interface EntityDefinition {
  name: string;
  plural: string;
  tableName: string;
  fields: EntityField[];
  hasOwnerRelationship?: boolean;
}

export interface EndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  requiresAuth: boolean;
}
