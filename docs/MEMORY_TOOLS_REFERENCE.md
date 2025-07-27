# Memory Tools Quick Reference

## Available Tools

### 🧠 store_session_context

**Store analysis results, decisions, and insights**

```json
{
  "project_id": "string",
  "session_type": "analysis|implementation|debugging|planning|review",
  "context_summary": "Brief summary of session",
  "key_insights": ["insight1", "insight2"],
  "decisions_made": [
    {
      "decision": "What was decided",
      "reasoning": "Why it was decided",
      "alternatives_considered": ["option1", "option2"]
    }
  ],
  "code_changes": [
    {
      "file_path": "path/to/file",
      "change_type": "created|modified|deleted|refactored",
      "description": "What changed",
      "impact": "Effect of change"
    }
  ],
  "next_steps": ["step1", "step2"]
}
```

### 🔍 retrieve_relevant_context

**Get relevant context for current task**

```json
{
  "project_id": "string",
  "current_task": "Description of what you're working on",
  "session_types": ["analysis", "implementation"],
  "include_code_changes": true,
  "include_decisions": true,
  "max_results": 10
}
```

### 📸 create_knowledge_snapshot

**Create comprehensive project state snapshot**

```json
{
  "project_id": "string",
  "snapshot_name": "Descriptive name",
  "architecture_overview": "High-level architecture description",
  "key_components": [
    {
      "name": "ComponentName",
      "purpose": "What it does",
      "dependencies": ["dep1", "dep2"],
      "status": "planned|in-progress|completed|needs-review"
    }
  ],
  "technical_constraints": ["constraint1", "constraint2"],
  "design_patterns": ["pattern1", "pattern2"],
  "current_challenges": ["challenge1", "challenge2"]
}
```

### 🔎 query_project_knowledge

**Search project knowledge with natural language**

```json
{
  "project_id": "string",
  "query": "Natural language question about the project",
  "knowledge_types": [
    "decisions",
    "architecture",
    "code_changes",
    "insights",
    "challenges",
    "patterns"
  ],
  "time_range": "last_day|last_week|last_month|all_time"
}
```

## Quick Workflows

### 🚀 Session Start

```
1. retrieve_relevant_context
2. Review returned context
3. Proceed with informed understanding
```

### 🏁 Session End

```
1. Summarize key insights
2. store_session_context
3. Include next steps
```

### 🎯 Feature Development

```
Planning:
- query_project_knowledge for similar features
- retrieve_relevant_context for constraints
- store_session_context with planning decisions

Implementation:
- retrieve_relevant_context for current task
- store_session_context with code changes

Review:
- query_project_knowledge for patterns
- create_knowledge_snapshot if major milestone
```

### 🐛 Bug Investigation

```
1. query_project_knowledge with error description
2. retrieve_relevant_context for recent changes
3. store_session_context with solution
```

### 🏗️ Architecture Review

```
1. create_knowledge_snapshot of current state
2. query_project_knowledge for decisions
3. store_session_context with review findings
```

## Memory Types

| Type                 | Purpose               | When to Use          |
| -------------------- | --------------------- | -------------------- |
| `session_context`    | Store session results | End of work sessions |
| `knowledge_snapshot` | Comprehensive state   | Major milestones     |
| `decision`           | Individual decisions  | Important choices    |
| `note`               | General information   | Ongoing observations |
| `issue`              | Problems found        | Bug reports          |
| `milestone`          | Project milestones    | Achievement markers  |

## Best Practices

### ✅ Do

- Start sessions with `retrieve_relevant_context`
- End sessions with `store_session_context`
- Include reasoning in decisions
- Use specific, descriptive queries
- Create snapshots at milestones
- Document alternatives considered

### ❌ Don't

- Store vague or generic information
- Skip context retrieval at session start
- Forget to include next steps
- Use overly broad queries
- Store duplicate information
- Ignore retrieved context

## Common Patterns

### New Feature

```
retrieve_relevant_context → plan → implement → store_session_context
```

### Bug Fix

```
query_project_knowledge → investigate → fix → store_session_context
```

### Code Review

```
retrieve_relevant_context → review → store_session_context
```

### Architecture Decision

```
query_project_knowledge → analyze → decide → create_knowledge_snapshot
```

### Refactoring

```
create_knowledge_snapshot → plan → refactor → store_session_context
```

## Integration Examples

### With Cursor AI

```typescript
// In .cursorrules
// 1. Always start with context retrieval
// 2. Store important decisions
// 3. Create snapshots for major changes
```

### With Claude Desktop

```json
// Use MCP tools directly
// Maintain conversation context
// Store analysis results
```

### With Trae IDE

```json
// Integrate into development workflow
// Store code review insights
// Maintain project understanding
```

### With CLI Scripts

```bash
# Automate memory management
# Script context storage
# Integrate with CI/CD
```

## Troubleshooting

| Problem            | Solution                             |
| ------------------ | ------------------------------------ |
| No context found   | Check project_id, use broader terms  |
| Too much context   | Use filters, specific queries        |
| Irrelevant results | Improve storage quality, be specific |
| Performance slow   | Limit results, use time ranges       |
| Missing decisions  | Include reasoning when storing       |
| Outdated info      | Regular cleanup, update snapshots    |

## Tips for LLMs With Thinking Capabilities

1. **Leverage compound intelligence** - Combine retrieved context with deep reasoning for superior decisions
2. **Analyze patterns across time** - Use historical data to identify trends and evolution patterns
3. **Synthesize complex insights** - Merge current analysis with accumulated project wisdom
4. **Make strategic decisions** - Use comprehensive context for long-term architectural planning
5. **Cross-reference implementations** - Compare current approach with historical solutions
6. **Build on previous reasoning** - Extend and refine earlier analytical work
7. **Create knowledge synthesis** - Generate new insights from combined historical and current data
8. **Perform deep contextual analysis** - Use thinking capabilities to extract maximum value from retrieved context

## Tips for LLMs Without Thinking

1. **Always retrieve context first** - Don't start work without understanding previous decisions
2. **Store everything important** - Decisions, insights, code changes, next steps
3. **Use specific queries** - Include technical terms and context
4. **Create regular snapshots** - Capture comprehensive understanding
5. **Include reasoning** - Always explain why decisions were made
6. **Plan next steps** - Help future sessions continue smoothly
7. **Review retrieved context** - Actually use the information provided
8. **Update understanding** - Modify approach based on stored knowledge

This memory system transforms stateless interactions into stateful, context-aware development sessions for all types of LLMs.
