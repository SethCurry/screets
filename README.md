# screets

## General Tasks

- Clean up removed screeps' memory
- Check if we need to spawn any new screeps
  - Are there open spots to mine resources?
  - Are there enemies to kill?
  - Are there resources on the ground to gather?
- Check if there are resources to mine

## Design

Using intents that are stored and can be referenced; that way we can see not only
what our creeps are currently doing, but what they will be doing in the future.

This avoids spam spawning creeps until flooding some condition.
