# Memory Integration Example

This example demonstrates how to integrate the Project Agent's memory management tools with various AI assistants to overcome thinking limitations and maintain context across sessions.

## Problem Scenario

You're working on a complex React application with multiple developers. Each AI session loses context from previous work, leading to:

- Repeated analysis of the same problems
- Inconsistent architectural decisions
- Lost insights from debugging sessions
- Difficulty maintaining project understanding

## Solution: Memory-Enhanced Workflow

### 1. Session Start Pattern

**Before starting any work:**

```json
{
  "tool": "retrieve_relevant_context",
  "params": {
    "project_id": "react-ecommerce-app",
    "current_task": "Implementing user authentication with JWT tokens",
    "session_types": ["implementation", "debugging", "analysis"],
    "include_code_changes": true,
    "include_decisions": true,
    "max_results": 10
  }
}
```

**Response provides:**

- Previous authentication-related decisions
- Code changes in auth modules
- Security considerations discussed
- Integration patterns used

### 2. During Development

**When making important decisions:**

```json
{
  "tool": "store_session_context",
  "params": {
    "project_id": "react-ecommerce-app",
    "session_type": "implementation",
    "context_summary": "Implemented JWT authentication with refresh token rotation",
    "key_insights": [
      "Used httpOnly cookies for refresh tokens to prevent XSS",
      "Implemented automatic token refresh in axios interceptor",
      "Added proper error handling for expired tokens"
    ],
    "decisions_made": [
      {
        "decision": "Use httpOnly cookies for refresh tokens instead of localStorage",
        "reasoning": "Prevents XSS attacks and follows security best practices",
        "alternatives_considered": [
          "localStorage",
          "sessionStorage",
          "memory storage"
        ]
      }
    ],
    "code_changes": [
      {
        "file_path": "src/auth/AuthService.ts",
        "change_type": "created",
        "description": "Main authentication service with JWT handling",
        "impact": "Centralized auth logic, improved security"
      },
      {
        "file_path": "src/utils/axiosConfig.ts",
        "change_type": "modified",
        "description": "Added token refresh interceptor",
        "impact": "Automatic token renewal, better UX"
      }
    ],
    "next_steps": [
      "Add unit tests for AuthService",
      "Implement role-based access control",
      "Add logout functionality"
    ]
  }
}
```

### 3. Knowledge Snapshots

**At major milestones:**

```json
{
  "tool": "create_knowledge_snapshot",
  "params": {
    "project_id": "react-ecommerce-app",
    "snapshot_name": "Authentication System Complete",
    "architecture_overview": "JWT-based authentication with refresh token rotation, role-based access control, and secure cookie storage",
    "key_components": [
      {
        "name": "AuthService",
        "purpose": "Handles login, logout, token refresh, and user state management",
        "dependencies": ["axios", "js-cookie"],
        "status": "completed"
      },
      {
        "name": "ProtectedRoute",
        "purpose": "Route wrapper for authenticated pages",
        "dependencies": ["react-router", "AuthService"],
        "status": "completed"
      },
      {
        "name": "RoleGuard",
        "purpose": "Component-level role-based access control",
        "dependencies": ["AuthService"],
        "status": "in-progress"
      }
    ],
    "technical_constraints": [
      "Must support IE11 for enterprise clients",
      "Token expiry must be configurable",
      "Must integrate with existing user management API"
    ],
    "design_patterns": [
      "Service pattern for auth logic",
      "Higher-order components for route protection",
      "Context API for global auth state"
    ],
    "current_challenges": [
      "Handling concurrent requests during token refresh",
      "Testing authentication flows in Jest"
    ]
  }
}
```

### 4. Querying Project Knowledge

**When encountering similar problems:**

```json
{
  "tool": "query_project_knowledge",
  "params": {
    "project_id": "react-ecommerce-app",
    "query": "How did we handle token refresh conflicts when multiple API calls happen simultaneously?",
    "knowledge_types": ["decisions", "code_changes", "insights"],
    "time_range": "all_time"
  }
}
```

## Integration Examples

### Cursor AI Integration

**In your `.cursorrules` file:**

```markdown
# Project Context Rules

## Memory Management

1. ALWAYS start sessions by retrieving relevant context
2. Store important decisions and insights
3. Create knowledge snapshots at milestones
4. Query existing knowledge before making architectural decisions

## Session Pattern

1. retrieve_relevant_context for current task
2. Review returned context before proceeding
3. store_session_context with results
4. Include next_steps for continuity

## Decision Documentation

- Always include reasoning and alternatives
- Document technical constraints
- Record design patterns used
- Note integration challenges
```

### Claude Desktop Integration

**Start each conversation:**

```
Before we begin, let me retrieve the relevant context for this task:

[Use retrieve_relevant_context tool]

Based on the context, I can see that...
[Proceed with informed understanding]
```

**End each session:**

```
Let me store the key insights from this session:

[Use store_session_context tool]

Next time we work on this project, you'll have access to:
- The decisions we made today
- The code changes implemented
- The next steps identified
```

### Trae IDE Integration

**Workflow automation:**

```typescript
// Auto-retrieve context when opening project files
const onFileOpen = async (filePath: string) => {
  if (isProjectFile(filePath)) {
    const context = await retrieveRelevantContext({
      project_id: getProjectId(),
      current_task: `Working on ${filePath}`,
      include_code_changes: true,
    });

    showContextPanel(context);
  }
};

// Auto-store context on significant changes
const onSignificantChange = async (changes: CodeChange[]) => {
  await storeSessionContext({
    project_id: getProjectId(),
    session_type: 'implementation',
    code_changes: changes,
    context_summary: generateSummary(changes),
  });
};
```

## Benefits Demonstrated

### Before Memory Integration

```
Session 1: "Let's implement authentication"
- Researches JWT best practices
- Decides on localStorage for tokens
- Implements basic login

Session 2: "Let's improve authentication security"
- Re-researches security best practices
- Discovers localStorage vulnerability
- Refactors to use httpOnly cookies
- Loses context of previous implementation

Session 3: "Let's add token refresh"
- Doesn't know about existing security decisions
- Implements conflicting approach
- Creates inconsistent architecture
```

### After Memory Integration

```
Session 1: "Let's implement authentication"
- Retrieves: No previous auth context
- Researches and implements with security focus
- Stores: Security decisions and rationale

Session 2: "Let's improve authentication"
- Retrieves: Previous security decisions
- Builds on existing secure foundation
- Stores: Improvements and lessons learned

Session 3: "Let's add token refresh"
- Retrieves: Complete auth architecture context
- Implements consistent with existing patterns
- Stores: Integration approach and testing strategy
```

## Measuring Success

### Context Continuity

- ✅ Sessions start with relevant background
- ✅ Decisions build on previous work
- ✅ Architectural consistency maintained
- ✅ No repeated analysis of same problems

### Knowledge Accumulation

- ✅ Project understanding grows over time
- ✅ Best practices are documented and reused
- ✅ Mistakes are recorded and avoided
- ✅ Team knowledge is preserved

### Development Efficiency

- ✅ Faster onboarding for new team members
- ✅ Reduced time spent on context switching
- ✅ Better architectural decisions
- ✅ Improved code quality and consistency

## Common Patterns

### Feature Development Cycle

```
1. retrieve_relevant_context ("implementing feature X")
2. Review existing patterns and constraints
3. Plan implementation based on context
4. Implement with consistent architecture
5. store_session_context with decisions and code
6. create_knowledge_snapshot if major feature
```

### Bug Investigation Cycle

```
1. query_project_knowledge ("similar error symptoms")
2. retrieve_relevant_context ("recent changes in affected area")
3. Investigate with historical context
4. Fix with understanding of root cause
5. store_session_context with solution and prevention
```

### Code Review Cycle

```
1. retrieve_relevant_context ("changes in PR")
2. Review against established patterns
3. Check consistency with architectural decisions
4. store_session_context with review insights
5. Update knowledge if new patterns emerge
```

## Advanced Use Cases for Thinking-Capable LLMs

### Strategic Architecture Analysis

**Scenario**: Evaluating whether to migrate from REST to GraphQL

```json
{
  "tool": "query_project_knowledge",
  "params": {
    "project_id": "react-ecommerce-app",
    "query": "API design decisions, performance bottlenecks, and client-server communication patterns",
    "knowledge_types": ["decisions", "architecture", "challenges", "patterns"],
    "time_range": "all_time"
  }
}
```

**Thinking LLM Analysis**:

- Synthesizes historical API performance data
- Analyzes evolution of client requirements
- Considers team expertise and migration costs
- Makes strategic recommendation based on comprehensive context
- Documents reasoning for future architectural decisions

### Cross-Project Pattern Recognition

**Scenario**: Implementing caching strategy

```json
{
  "tool": "retrieve_relevant_context",
  "params": {
    "project_id": "react-ecommerce-app",
    "current_task": "Implementing Redis caching for product catalog",
    "session_types": ["implementation", "analysis"],
    "include_decisions": true,
    "max_results": 15
  }
}
```

**Thinking LLM Synthesis**:

- Identifies patterns from previous caching implementations
- Analyzes what worked well and what caused issues
- Considers current system constraints and requirements
- Designs optimal caching strategy based on learned patterns
- Documents new insights for future reference

### Complex Problem Solving

**Scenario**: Debugging intermittent race condition

```json
{
  "tool": "query_project_knowledge",
  "params": {
    "project_id": "react-ecommerce-app",
    "query": "race conditions, concurrent requests, state management issues, timing problems",
    "knowledge_types": ["issues", "decisions", "code_changes"],
    "time_range": "all_time"
  }
}
```

**Thinking LLM Deep Analysis**:

- Correlates current symptoms with historical issues
- Analyzes code evolution that might have introduced the problem
- Considers system architecture and concurrency patterns
- Develops comprehensive debugging strategy
- Creates detailed investigation plan with multiple hypotheses

### Benefits for Thinking LLMs

- **Enhanced Reasoning**: More context enables deeper, more nuanced analysis
- **Pattern Synthesis**: Ability to identify and apply complex patterns across time
- **Strategic Planning**: Long-term architectural decisions based on comprehensive understanding
- **Compound Intelligence**: Each session builds exponentially on previous knowledge
- **Sophisticated Debugging**: Multi-dimensional problem analysis using historical context

This memory-enhanced workflow transforms disconnected AI sessions into a continuous, context-aware development experience for all types of LLMs.
