# BOB Usage Guide (Cost-Optimized Best Practices)

## Overview

This document explains how to use BOB efficiently while minimizing Bobcoin consumption. It focuses on proper prompting, file usage, mode selection, and project structure alignment to ensure maximum output quality with minimal cost.

---

## 1. Core Principle: Minimize Context and Maximize Structure

BOB performs best when:

* Inputs are structured
* Context is minimal and relevant
* Tasks are clearly defined
* Outputs are strictly formatted

Avoid sending unnecessary files or large unfiltered context.

---

## 2. Use `.bobignore` Effectively

### Purpose

Reduces unnecessary file scanning and context loading, directly lowering Bobcoin usage.

### Best Practices

* Always define `.bobignore` at project root before running BOB
* Exclude:

  * documentation folders not needed for logic
  * logs and build artifacts
  * dependencies (`node_modules`)
  * sensitive or large files

### Example

```text
01-documentations/
node_modules/
build/
dist/
*.log
.env
```

### Rule

Only include files that directly affect execution logic or output generation.

---

## 3. Use Context Mentions Instead of Full Loading

### Preferred Method

Use targeted file references:

```
@core/task_definition.md
@core/agent_workflow.md
@core/output_schema.json
```

### Avoid

* Copy-pasting entire files into prompts
* Loading entire directories unnecessarily
* Sending redundant context across multiple messages

### Benefit

Reduces token usage significantly and improves response accuracy.

---

## 4. Proper Mode Selection Strategy

BOB operates using modes. Choosing the correct mode prevents unnecessary computation.

### Plan Mode

Use when:

* Starting a new task
* Defining structure
* Breaking down requirements

Avoid generating final outputs in this mode.

---

### Orchestrator Mode

Use when:

* Task involves multiple steps
* Coordination between extraction, classification, and generation is needed

---

### Code Mode

Use when:

* Producing final structured output
* Executing full pipeline in a single pass

---

### Ask Mode

Use only when:

* Critical information is missing
* No safe assumptions can be made

---

### Advanced Mode

Use only for:

* Complex reasoning tasks
* Non-standard workflows

---

## 5. Single-Pass Execution Rule

### Definition

BOB should complete the entire pipeline in one execution whenever possible.

### Required Flow

1. Plan
2. Process
3. Generate output
4. Validate schema

### Avoid

* Iterative refinement loops
* Multiple partial outputs
* Reprocessing the same input

---

## 6. Efficient Prompting Strategy

### Good Prompt Pattern

Clearly structured input:

```
Task: Match CV to job description

Input:
- CV: @sample_cv.json
- Job: @sample_job.json

Output format: output_schema.json
```

### Bad Prompt Pattern

* Vague instructions
* Mixed goals in one request
* No output format definition

---

## 7. Limit Output Scope

### Rules

* Request only what is needed
* Avoid multiple alternative outputs unless required
* Do not ask for explanations unless necessary

### Example

Preferred:
“Return job match results only in JSON format”

Avoid:
“Explain everything and also give alternatives and reasoning”

---

## 8. Token and Cost Control

### Key Strategies

* Keep prompts short and structured
* Avoid repeated context injection
* Use batching when possible
* Avoid redundant clarifications

### Config-Based Controls

Use `.bob/config.yaml`:

```yaml
auto_approve:
  enabled: false

suggestions:
  max_per_turn: 2

token_budget:
  per_request: 700
```

---

## 9. File Organization Discipline

### Required Structure

* `.bob/` → behavior rules only
* `core/` → system logic
* `intelligence/` → reasoning capabilities
* `optimization/` → cost control rules
* `demo/` → sample inputs and outputs

### Rule

Do not mix behavioral rules with system data or demo assets.

---

## 10. Validation Before Execution

Before running any task:

* Ensure correct mode is selected
* Ensure required context files are included
* Ensure output schema is defined
* Ensure `.bobignore` is configured

---

## Summary

To maximize BOB efficiency while minimizing Bobcoin usage:

* Use structured context references
* Enforce single-pass execution
* Apply strict mode selection
* Reduce unnecessary file scanning
* Limit output scope
* Maintain clean project separation

This ensures optimal performance, cost efficiency, and consistent structured outputs suitable for production-grade AI workflows.