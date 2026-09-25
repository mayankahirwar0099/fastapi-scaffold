import { EntityDefinition, EntityField } from '../types/generator';

// Pre-defined domain vocabularies for rich scaffolding
const DOMAIN_PATTERNS: Record<string, { entities: EntityDefinition[] }> = {
  task: {
    entities: [
      {
        name: 'Task',
        plural: 'tasks',
        tableName: 'tasks',
        hasOwnerRelationship: true,
        fields: [
          { name: 'title', type: 'str', nullable: false, description: 'Task title or summary' },
          { name: 'description', type: 'str', nullable: true, description: 'Optional detailed description' },
          { name: 'completed', type: 'bool', nullable: false, defaultValue: 'False', description: 'Completion status flag' },
          { name: 'priority', type: 'str', nullable: false, defaultValue: '"medium"', description: 'Priority level (low/medium/high)' },
          { name: 'due_date', type: 'datetime', nullable: true, description: 'Target completion timestamp' },
        ],
      },
    ],
  },
  ecommerce: {
    entities: [
      {
        name: 'Product',
        plural: 'products',
        tableName: 'products',
        hasOwnerRelationship: false,
        fields: [
          { name: 'name', type: 'str', nullable: false, description: 'Product title' },
          { name: 'sku', type: 'str', nullable: false, isUnique: true, description: 'Unique Stock Keeping Unit' },
          { name: 'price', type: 'float', nullable: false, defaultValue: '0.0', description: 'Retail price in USD' },
          { name: 'inventory_count', type: 'int', nullable: false, defaultValue: '0', description: 'Available stock quantity' },
          { name: 'is_active', type: 'bool', nullable: false, defaultValue: 'True', description: 'Listing availability status' },
        ],
      },
      {
        name: 'Order',
        plural: 'orders',
        tableName: 'orders',
        hasOwnerRelationship: true,
        fields: [
          { name: 'order_number', type: 'str', nullable: false, isUnique: true, description: 'Public order identifier' },
          { name: 'total_amount', type: 'float', nullable: false, defaultValue: '0.0', description: 'Calculated order total' },
          { name: 'status', type: 'str', nullable: false, defaultValue: '"pending"', description: 'Fulfillment status (pending/shipped/delivered)' },
        ],
      },
    ],
  },
  blog: {
    entities: [
      {
        name: 'Post',
        plural: 'posts',
        tableName: 'posts',
        hasOwnerRelationship: true,
        fields: [
          { name: 'title', type: 'str', nullable: false, description: 'Post headline' },
          { name: 'slug', type: 'str', nullable: false, isUnique: true, description: 'URL-safe slug' },
          { name: 'content', type: 'str', nullable: false, description: 'Post markdown or HTML body' },
          { name: 'published', type: 'bool', nullable: false, defaultValue: 'False', description: 'Publication visibility flag' },
          { name: 'view_count', type: 'int', nullable: false, defaultValue: '0', description: 'Total lifetime page views' },
        ],
      },
    ],
  },
  fitness: {
    entities: [
      {
        name: 'Workout',
        plural: 'workouts',
        tableName: 'workouts',
        hasOwnerRelationship: true,
        fields: [
          { name: 'title', type: 'str', nullable: false, description: 'Workout routine label' },
          { name: 'category', type: 'str', nullable: false, defaultValue: '"strength"', description: 'Discipline (cardio/strength/mobility)' },
          { name: 'duration_minutes', type: 'int', nullable: false, defaultValue: '45', description: 'Session duration in minutes' },
          { name: 'calories_burned', type: 'int', nullable: true, defaultValue: '0', description: 'Estimated energy expenditure' },
        ],
      },
    ],
  },
  ai: {
    entities: [
      {
        name: 'AgentRun',
        plural: 'agent_runs',
        tableName: 'agent_runs',
        hasOwnerRelationship: true,
        fields: [
          { name: 'prompt', type: 'str', nullable: false, description: 'Initial user prompt or instruction' },
          { name: 'model_name', type: 'str', nullable: false, defaultValue: '"gemini-1.5-flash"', description: 'Language model identifier' },
          { name: 'output_text', type: 'str', nullable: true, description: 'Synthesized completion response' },
          { name: 'tokens_used', type: 'int', nullable: false, defaultValue: '0', description: 'Total token consumption' },
          { name: 'execution_seconds', type: 'float', nullable: false, defaultValue: '0.0', description: 'Wall-clock runtime latency' },
        ],
      },
    ],
  },
  iot: {
    entities: [
      {
        name: 'DeviceMetric',
        plural: 'metrics',
        tableName: 'device_metrics',
        hasOwnerRelationship: false,
        fields: [
          { name: 'device_id', type: 'str', nullable: false, description: 'Hardware telemetry device identifier' },
          { name: 'metric_type', type: 'str', nullable: false, description: 'Telemetry channel (temperature/humidity/pressure)' },
          { name: 'metric_value', type: 'float', nullable: false, description: 'Raw numeric sensor reading' },
          { name: 'is_anomalous', type: 'bool', nullable: false, defaultValue: 'False', description: 'Out-of-bounds anomaly alert' },
        ],
      },
    ],
  },
};

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pluralize(str: string): string {
  if (str.endsWith('y')) {
    return str.slice(0, -1) + 'ies';
  }
  if (str.endsWith('s') || str.endsWith('ch') || str.endsWith('sh')) {
    return str + 'es';
  }
  return str + 's';
}

export function parseProjectIdea(rawIdea: string): {
  inferredProjectTitle: string;
  entities: EntityDefinition[];
  summary: string;
} {
  const idea = rawIdea.toLowerCase();

  // Check matching predefined domain
  if (idea.includes('task') || idea.includes('todo') || idea.includes('to-do') || idea.includes('kanban') || idea.includes('project management')) {
    return {
      inferredProjectTitle: 'TaskFlow API',
      entities: DOMAIN_PATTERNS.task.entities,
      summary: 'Task management service with status tracking, priority flags, and user assignment.',
    };
  }

  if (idea.includes('store') || idea.includes('ecommerce') || idea.includes('e-commerce') || idea.includes('shop') || idea.includes('product') || idea.includes('cart') || idea.includes('order')) {
    return {
      inferredProjectTitle: 'CommerceCore API',
      entities: DOMAIN_PATTERNS.ecommerce.entities,
      summary: 'E-commerce catalog and order processing backend with SKU tracking and inventory metrics.',
    };
  }

  if (idea.includes('blog') || idea.includes('article') || idea.includes('post') || idea.includes('content') || idea.includes('cms')) {
    return {
      inferredProjectTitle: 'Inkwell CMS API',
      entities: DOMAIN_PATTERNS.blog.entities,
      summary: 'Content publishing service with slug resolution, drafts, and analytics.',
    };
  }

  if (idea.includes('fitness') || idea.includes('workout') || idea.includes('gym') || idea.includes('habit') || idea.includes('exercise')) {
    return {
      inferredProjectTitle: 'PulseFit API',
      entities: DOMAIN_PATTERNS.fitness.entities,
      summary: 'Activity and fitness tracker recording workout duration, categories, and metrics.',
    };
  }

  if (idea.includes('agent') || idea.includes('llm') || idea.includes('ai') || idea.includes('prompt') || idea.includes('chat')) {
    return {
      inferredProjectTitle: 'NexusAI Backend',
      entities: DOMAIN_PATTERNS.ai.entities,
      summary: 'AI agent runtime orchestrator storing prompt execution logs, model metadata, and token stats.',
    };
  }

  if (idea.includes('iot') || idea.includes('sensor') || idea.includes('telemetry') || idea.includes('device') || idea.includes('metric')) {
    return {
      inferredProjectTitle: 'SensorNet API',
      entities: DOMAIN_PATTERNS.iot.entities,
      summary: 'High-frequency telemetry ingestion platform with anomaly detection and device identifiers.',
    };
  }

  // Dynamic heuristics: Try to extract candidate entity nouns from the prompt
  // e.g. "A recipe sharing platform with ingredients and ratings" -> Recipe
  const words = rawIdea
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  // Common stop words to skip
  const stopWords = new Set([
    'the', 'and', 'with', 'for', 'api', 'app', 'system', 'service', 'platform',
    'backend', 'fastapi', 'tool', 'that', 'this', 'create', 'build', 'using',
    'simple', 'management', 'application', 'rest', 'endpoints'
  ]);

  const candidateNouns = words.filter((w) => !stopWords.has(w.toLowerCase()));
  const primaryEntityName = candidateNouns.length > 0 ? capitalize(candidateNouns[0]) : 'Item';
  const tableName = primaryEntityName.toLowerCase() + 's';

  const dynamicEntity: EntityDefinition = {
    name: primaryEntityName,
    plural: pluralize(primaryEntityName.toLowerCase()),
    tableName,
    hasOwnerRelationship: true,
    fields: [
      { name: 'name', type: 'str', nullable: false, description: `${primaryEntityName} name or identifier` },
      { name: 'description', type: 'str', nullable: true, description: 'Detailed context or notes' },
      { name: 'is_active', type: 'bool', nullable: false, defaultValue: 'True', description: 'Active record state' },
      { name: 'metadata_info', type: 'str', nullable: true, description: 'Supplemental structured metadata' },
    ],
  };

  return {
    inferredProjectTitle: `${primaryEntityName} Hub API`,
    entities: [dynamicEntity],
    summary: `RESTful service managing ${primaryEntityName.toLowerCase()} resources with CRUD lifecycle operations.`,
  };
}
