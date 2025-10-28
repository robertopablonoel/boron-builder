# System Prompt Documentation

## Overview

The system prompt is the core intelligence of Boron Builder. It instructs Claude on how to generate and iterate eCommerce funnels.

## Prompt Structure

1. **Identity**: Defines Claude's role as conversion copywriter
2. **Capabilities**: Lists what the AI can do
3. **Block Library**: Specifies allowed components
4. **Rules**: Funnel structure requirements
5. **Copy Guidelines**: Do's and don'ts
6. **Compliance**: Legal/policy constraints
7. **Output Format**: JSON structure
8. **Examples**: Sample funnels

## Key Design Decisions

### Why Block-Based?

- **Consistency**: All funnels use proven patterns
- **Safety**: No arbitrary HTML/CSS injection
- **Mobile-first**: Every block is responsive
- **Fast rendering**: Component registry lookup

### Why Strict Rules?

- **Conversion focus**: Force best practices
- **Compliance**: Prevent policy violations
- **Quality**: Reduce edge cases

### Why Full Funnel Returns?

- **Simplicity**: Frontend always has complete state
- **Iteration**: Each response is independently valid
- **Debugging**: Easy to inspect and validate

## Prompt Tuning

### To increase creativity:
- Reduce rule strictness
- Add more tone variations
- Allow optional blocks

### To increase compliance:
- Add more restricted terms
- Require disclaimers
- Strengthen guardrails

### To improve speed:
- Use short prompt variant
- Reduce example length
- Simplify instructions

## Testing Checklist

- [ ] Generates valid JSON
- [ ] Includes required blocks (CTA)
- [ ] Follows structure rules
- [ ] Avoids medical claims
- [ ] Uses benefit-driven copy
- [ ] Mobile-optimized copy length
- [ ] Proper block ordering

## Versions

- **v1.0** - Initial prompt with all 13 blocks
- **short** - Minimal version for testing
- **compliance** - Extra strict for regulated products

## Examples

See `examples.ts` for full sample outputs.
