# Development Guide for Corgi Transform Adventure

Welcome! This guide will help you get started with developing this game using Claude Code, even if you're new to programming or terminals.

## This Project is for YOU!

**This game was created specifically as a learning project for beginners!** Whether you've never coded before or you're looking to practice your skills, you're welcome here. We encourage:

- 🎮 **New levels** - Design your own challenges!
- 📖 **Story additions** - What happens after level 5? You decide!
- 🎨 **Visual improvements** - New enemies, backgrounds, or animations
- 🎵 **Sound effects** - Add new music or sound effects
- 💡 **Creative features** - Power-ups, abilities, or game mechanics
- 🐛 **Bug fixes** - Found something broken? Fix it!
- 📝 **Documentation** - Help others by improving guides like this one

**No contribution is too small!** Even fixing a typo or adjusting a color helps make the game better. This is a safe space to learn, experiment, and have fun with code.

## What is a Terminal?

The terminal (also called Command Prompt on Windows or Terminal on Mac/Linux) is a text-based way to control your computer. Instead of clicking on icons, you type commands. Don't worry - this guide will show you exactly what to type!

### How to Open the Terminal

**On Mac:**
1. Press `Cmd + Space` to open Spotlight
2. Type "Terminal" and press Enter
3. A black/white window will appear - this is your terminal!

**On Windows:**
1. Press `Windows key + R`
2. Type "cmd" and press Enter
3. A black window will appear - this is your Command Prompt!

**On Linux:**
1. Press `Ctrl + Alt + T`
2. Or look for "Terminal" in your applications menu

### Terminal Basics - Quick Reference

- **Type commands exactly as shown** (computers are picky about spelling!)
- **Press Enter after each command** to run it
- **Wait for commands to finish** before typing the next one
- **The blinking cursor shows where you'll type**
- **You might not see a cursor when typing passwords** (that's normal!)
- **Use arrow keys** to move through previous commands
- **Can't type?** Click in the terminal window first

## Table of Contents
1. [What is Claude Code?](#what-is-claude-code)
2. [Installing Claude Code](#installing-claude-code)
3. [Getting the Game Code](#getting-the-game-code)
4. [Making Changes](#making-changes)
5. [Working with Claude](#working-with-claude)
6. [Saving Your Changes](#saving-your-changes)
7. [Tips for Success](#tips-for-success)

## What is Claude Code?

Claude Code is an AI-powered coding assistant that can help you write, debug, and improve code through natural conversation. It's like having an experienced programmer sitting next to you, ready to help!

## Installing Claude Code

### Step 1: Install Claude Code

**Important:** All commands below should be typed in your terminal window!

1. **On Mac:**
   - First, open Terminal (see instructions above)
   - Type this command and press Enter:
   ```bash
   brew install claude-code
   ```
   - Wait for it to finish installing
   
2. **On Windows:**
   - Download the installer from [claude.ai/code](https://claude.ai/code)
   - Run the installer and follow the prompts
   - After installation, open Command Prompt to continue
   
3. **On Linux:**
   - Open Terminal (see instructions above)
   - Type this command and press Enter:
   ```bash
   curl -fsSL https://claude.ai/install.sh | sh
   ```

### Step 2: Set Up Your API Key

1. Get your API key from [claude.ai/settings](https://claude.ai/settings)
2. In your terminal window, type this command and press Enter:
   ```bash
   claude-code auth login
   ```
3. When it asks for your API key, paste it and press Enter
   - **Tip:** On Mac use `Cmd+V` to paste, on Windows use `Ctrl+V`

## Getting the Game Code

### If you're new to Git:

Git is a tool that helps track changes to code. Think of it like a "save game" system for programming!

### Step 1: Install Git

1. **On Mac:** Git comes pre-installed
2. **On Windows:** Download from [git-scm.com](https://git-scm.com)
3. **On Linux:** `sudo apt-get install git` (Ubuntu/Debian)

### Step 2: Clone the Repository

**All of these commands should be typed in your terminal window!**

1. Make sure your terminal is open (Terminal on Mac/Linux, Command Prompt on Windows)

2. Navigate to where you want to save the game. Type this and press Enter:
   ```bash
   cd ~/Desktop
   ```
   - This moves you to your Desktop folder
   - You should see the command prompt change to show you're on the Desktop

3. Clone (download) the game. Type this and press Enter:
   ```bash
   git clone https://github.com/nibty/corgi-transform-adventure.git
   ```
   - You'll see text scrolling as it downloads the files
   - Wait until it says "done" or shows your prompt again

4. Enter the game directory. Type this and press Enter:
   ```bash
   cd corgi-transform-adventure
   ```
   - This moves you into the game folder
   - Your terminal prompt should now show "corgi-transform-adventure"

## Making Changes

### Step 1: Start Claude Code

1. Make sure your terminal is still open and you're in the game directory
   - Your prompt should show "corgi-transform-adventure"
   - If not, type `cd ~/Desktop/corgi-transform-adventure` and press Enter

2. Start Claude Code by typing this command and pressing Enter:
```bash
claude-code
```
   - Claude will start and you'll see a message that it's ready
   - Now you can start typing your requests!

### Step 2: Ask Claude to Help

Here are some example requests you can make:

**Simple Changes (Great for First-Timers!):**
- "Can you make the corgi jump higher?"
- "Add more treats to level 2"
- "Change the color of the platforms to blue"
- "Make the policeman walk slower"
- "Add more melons to the farmer level"

**New Features (Fun Challenges!):**
- "Add a double jump ability for the human form"
- "Create a new enemy that throws tomatoes"
- "Add background music to level 3"
- "Create a power-up that makes you run faster"
- "Add a new level where you race against time"

**Story Ideas (Be Creative!):**
- "Add a level where the corgi has to rescue puppies"
- "Create a boss fight with a giant cat"
- "Make a underwater level where the corgi can swim"
- "Add cutscenes between levels that tell a story"
- "Create a secret level that unlocks after collecting all treats"

**Bug Fixes (Help Make the Game Better!):**
- "The player gets stuck in walls sometimes, can you fix it?"
- "The score doesn't reset when starting a new game"
- "Sometimes the music plays twice at the same time"

**Git Help (Claude Does This Too!):**
- "Can you commit my changes?"
- "Help me push to GitHub"
- "What files did I change?"
- "Can you write a commit message for what we just did?"
- "I got an error when trying to push, can you help?"

## Working with Claude

### Understanding Plan Mode

Sometimes when you ask Claude to do something complex, it will enter "Plan Mode". This is when Claude thinks through the task step-by-step before starting to code. Here's what you need to know:

**What is Plan Mode?**
- Claude's way of organizing complex tasks
- You'll see Claude list out the steps it plans to take
- Helps ensure nothing is forgotten

**When does it happen?**
- For multi-step features (like "create a whole new level with enemies and puzzles")
- When major changes affect multiple parts of the game
- For tasks that need careful planning

**What should you do?**
- Read through the plan
- If it looks good, just say "sounds good" or "go ahead"
- If you want changes, say something like "can we also add [your idea] to the plan?"
- Claude will then exit Plan Mode and start implementing

**Example:**
```
You: "Create a boss battle level with a giant cat that has three different attacks"

Claude: [Enters Plan Mode]
I'll help you create a boss battle level. Let me plan this out:
1. Create a GiantCat class with health and attack patterns
2. Add three different attacks (paw swipe, hairball, pounce)
3. Create the boss arena level
4. Add victory condition when boss is defeated
[Waits for your approval]

You: "Sounds good! Can we also make the cat change color when it gets angry?"

Claude: [Updates plan and then starts coding]
```

### Best Practices for Requests

1. **Be Specific:** Instead of "make it better", try "make the jump feel more responsive by increasing the jump force"

2. **One Thing at a Time:** Focus on one feature or fix per conversation

3. **Describe What You Want:** Explain the desired outcome, not just the problem

4. **Ask for Explanations:** Feel free to ask "How does this work?" or "Can you explain what you changed?"

### Example Conversation Flow

```
You: "I want to add a power-up that makes the corgi temporarily invincible"

Claude: [Creates the code for the power-up]

You: "Can you make the invincibility last 5 seconds instead of 3?"

Claude: [Adjusts the duration]

You: "Perfect! Now can you add a visual effect so players know they're invincible?"

Claude: [Adds a glowing effect]
```

## Saving Your Changes

### Understanding Git Commands

After making changes with Claude, you'll want to save them properly.

**Did you know?** Claude can help you with Git commands too! If you're unsure about any Git operation, just ask:
- "Claude, how do I commit my changes?"
- "Can you help me write a good commit message?"
- "I want to push my changes to GitHub"
- "Help me check what files I've changed"

Claude will run the Git commands for you and explain what's happening!

### Step 1: Check What Changed
```bash
git status
```
This shows you which files were modified.

### Step 2: Save Your Changes Locally
```bash
git add .
git commit -m "Add invincibility power-up with visual effects"
```

### Step 3: Upload to GitHub (if you have access)
```bash
git push
```

### Common Git Commands Explained

- `git status` - Shows what files have changed
- `git add .` - Prepares all changes to be saved
- `git commit -m "message"` - Saves changes with a description
- `git push` - Uploads changes to GitHub
- `git pull` - Downloads latest changes from GitHub

**Tip:** If you're nervous about using Git, just ask Claude! Say something like "I'm done with my changes, can you help me commit them?" and Claude will guide you through the process.

## Tips for Success

### For Complete Beginners

1. **Start Small:** Try changing colors or text before adding complex features
2. **Test Often:** Open `index.html` in your browser after each change
3. **Read the Code:** Ask Claude to explain existing code sections
4. **Keep Notes:** Write down what changes you made and why
5. **Don't Worry About Plan Mode:** If Claude enters Plan Mode, just read the plan and say "ok" or "looks good" if you're happy with it

### Working with Claude Code

1. **Be Patient:** Complex features might take multiple attempts
2. **Provide Context:** Tell Claude what you're trying to achieve overall
3. **Ask for Best Practices:** Claude can suggest better ways to implement features
4. **Request Comments:** Ask Claude to add comments explaining complex code

### Common Issues and Solutions

**Problem:** "I don't know if I'm in the terminal"
**Solution:** Look for a window with text and a blinking cursor. It might be black, white, or another color.

**Problem:** "The terminal says 'command not found'"
**Solution:** 
- Make sure you typed the command exactly as shown
- Check if the program is installed (try the installation steps again)
- On Windows, you might need to restart Command Prompt after installing

**Problem:** "I can't see what I'm typing in the terminal"
**Solution:** That's normal for passwords! Just type and press Enter.

**Problem:** "How do I know what directory I'm in?"
**Solution:** 
- Type `pwd` (Mac/Linux) or `cd` (Windows) and press Enter
- This shows your current location

**Problem:** "Claude says it can't find the file"
**Solution:** 
- Make sure you're in the right directory
- Type `cd ~/Desktop/corgi-transform-adventure` and press Enter
- Then try running `claude-code` again

**Problem:** "The game won't load after changes"
**Solution:** Check the browser console (F12) for errors, share them with Claude

**Problem:** "Git says there's a conflict"
**Solution:** Ask Claude: "I have a git merge conflict, can you help resolve it?"

### Project Structure

Understanding the game files:
- `index.html` - The game's webpage structure
- `game.js` - All the game logic and mechanics
- `README.md` - Information about the game
- `CLAUDE.md` - Notes for Claude about the project

### Testing Your Changes

1. Save all files
2. Open `index.html` in a web browser
3. Press F12 to open developer tools if you see errors
4. Test the specific feature you changed

### Getting Help

If you're stuck:
1. Ask Claude to explain the error
2. Search for the error message online
3. Try a simpler version of what you want
4. Take a break and come back later!

## Example Development Session

Here's what a typical session might look like:

```bash
# 1. Start your day by getting latest changes
git pull

# 2. Start Claude Code
claude-code

# 3. Work with Claude
# You: "Add a speed boost power-up that appears randomly in levels"
# Claude: [implements the feature]

# 4. Test in browser
# You: "Let me test this"
# [Open index.html and play test]

# 5. Save your work with Claude's help
# You: "The speed boost works great! Can you commit these changes?"
# Claude: [runs git add and git commit with a descriptive message]

# You: "Can you push it to GitHub?"
# Claude: [runs git push]
```

Or even simpler:

```
You: "I want to make the corgi's bark louder"
Claude: [makes the change]
You: "Perfect! Please commit this"
Claude: [handles all the Git commands for you]
```

## Remember

- Everyone starts as a beginner
- It's okay to make mistakes - you can always undo changes with Git
- Claude is here to help - ask questions!
- Have fun and be creative!

## Your Ideas Matter!

This game started as a simple experiment with Claude Code, and look how far it's come! Your contributions can make it even better. Here are some ideas to inspire you:

**Easy Starting Projects:**
- Add your favorite color as a platform theme
- Create a "super jump" treat that makes you jump really high
- Add more hidden treats to existing levels
- Make the corgi leave paw prints when walking
- Add a celebration animation when completing a level

**Medium Challenges:**
- Design Level 6 with your own theme
- Add weather effects (rain, snow, wind)
- Create a scoring system with high scores
- Add different corgi colors the player can choose
- Make enemies drop treats when defeated

**Advanced Ideas:**
- Add multiplayer where one person is human and one is corgi
- Create a level editor so players can make their own levels
- Add achievements for completing special challenges
- Make the game work on mobile phones
- Add different dog breeds with unique abilities

**Don't see your idea here?** That's even better! The best features come from fresh perspectives.

## How to Share Your Work

Once you've made changes you're proud of:
1. Test them thoroughly
2. Commit your changes (this guide shows you how!)
3. Consider sharing on GitHub or social media
4. Help others learn from what you created

Happy coding! 🎮🐕

**Remember: This project exists for people like you to learn and have fun. Welcome to the community!**