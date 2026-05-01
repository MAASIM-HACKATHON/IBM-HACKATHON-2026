Here is a clean **Markdown sample guide file** you can directly add to your project.
# BOB Sample Usage Guide (Efficient Chat Format)

## Overview
This guide shows how to properly interact with BOB using minimal tokens while maximizing structured output quality. It follows the project rules defined in `.bob/`, `core/`, and `intelligence/` directories.

---

## 1. Do Modes Need to Be Included?

### No (Default Behavior)
BOB modes are handled by the IDE UI layer automatically.

You should NOT manually specify:
- PLAN MODE
- CODE MODE
- ORCHESTRATOR MODE

### Why?
- Mode selection is automated in IBM BOB
- The system determines the correct mode based on task type
- Adding modes in prompts increases token usage unnecessarily

### Exception
Only specify modes if:
- You are debugging system behavior
- The IDE fails to select the correct mode
- You are testing rule enforcement

---

## 2. Recommended Chat Format

### Standard Format (Best Balance)

```

Task: Match CV to Job Description

Input:
CV: @demo/sample_cv.json
Job: @demo/sample_job.json

Output format: output_schema.json

```

---

### Minimal Token Format (Most Efficient)

```

Match CV @demo/sample_cv.json with Job @demo/sample_job.json using output_schema.json

```

---

### Full Demo Format (For Presentations)

```

Task: Job Matching Analysis

Context:
@core/task_definition.md
@core/agent_workflow.md
@core/output_schema.json

Input:
@demo/sample_cv.json
@demo/sample_job.json

Return structured JSON only.

```

---

## 3. Best Practices for Efficiency

### DO
- Use file references instead of copying content
- Keep prompts short and structured
- Specify output format explicitly
- Use single-pass requests

### DO NOT
- Repeat instructions across messages
- Request multiple outputs in one prompt
- Ask for explanations unless necessary
- Re-send unchanged context

---

## 4. Input Strategy

BOB performs best when inputs are:

- Structured
- Minimal
- Clearly scoped

### Good Example
```

Task: Skill matching

Input:
@demo/sample_cv.json
@demo/sample_job.json

```

### Bad Example
```

Can you analyze this CV deeply, explain everything, compare multiple jobs, and give detailed reasoning and suggestions?

```

---

## 5. Output Control Rule

Always define:

```

Output format: output_schema.json

```

This ensures:
- structured output
- schema compliance
- reduced token usage
- predictable results

---

## 6. Core Efficiency Principle

BOB is optimized for:

> One input → One full structured output

Avoid iterative prompting unless required for debugging or missing data resolution.

---

## 7. Summary

To use BOB efficiently:
- Do not manually specify modes
- Always use structured input format
- Use file references instead of copying data
- Keep prompts minimal and explicit
- Always define output schema

This ensures:
- lower Bobcoin usage
- faster execution
- higher accuracy
- consistent structured outputs
```
