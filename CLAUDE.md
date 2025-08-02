# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based 2D platformer game called "Corgi Transform Adventure" where players can switch between human and corgi forms to solve puzzles and navigate levels.

## Project Structure

- `index.html` - Main HTML file with game UI and canvas setup
- `game.js` - Core game logic including:
  - Player class with transformation mechanics
  - Physics system (gravity, collisions)
  - Level system with platforms and interactive objects
  - Input handling and game loop
- `README.md` - User documentation

## Development Guidelines

### Running the Game
- Simply open `index.html` in a web browser
- No build process required (vanilla JavaScript)

### Key Game Systems
1. **Player System**: Handles both human and corgi forms with different abilities
2. **Physics**: Basic platformer physics with gravity and collision detection
3. **Level System**: Modular level design with platforms and interactive objects
4. **Transform Mechanic**: Core gameplay feature allowing form switching

### Adding New Features
- New levels: Add to the `levels` array in `game.js`
- New objects: Extend the `InteractiveObject` class
- New abilities: Add to the `Player` class update method

### Code Style
- Use ES6+ JavaScript features
- Keep game constants at the top of the file
- Separate concerns into classes (Player, Platform, Level, etc.)