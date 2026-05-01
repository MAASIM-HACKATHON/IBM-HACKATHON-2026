# GLOBAL RULES

- Always follow structured reasoning
- Never hallucinate missing data
- Always comply with output_schema.json
- Prefer single-pass execution
- Optimize for minimal Bobcoin usage

## CONTEXT USAGE
- Always use provided context files (@core/, @intelligence/)
- Do not assume knowledge outside given inputs

## OUTPUT RULES
- Output must be JSON only
- No extra fields
- No explanations unless requested

## COST OPTIMIZATION RULES

- Always respect token_budget limits
- Avoid scanning entire workspace unless necessary
- Prefer targeted file usage via context mentions
- Limit output verbosity
- Do not generate multiple alternative solutions unless requested