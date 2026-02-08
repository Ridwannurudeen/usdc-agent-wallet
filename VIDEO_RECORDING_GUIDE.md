# 🎥 Video Demo Recording Guide

## Quick Start

```bash
# Run the professional video demo script
./video-demo.sh
```

## Recording Options

### Option 1: Screen Recording Software (Recommended)

**macOS:**
```bash
# QuickTime Screen Recording
# 1. Open QuickTime Player
# 2. File → New Screen Recording
# 3. Run: ./video-demo.sh in fullscreen terminal
# 4. Stop recording when done
```

**Linux:**
```bash
# Using SimpleScreenRecorder or OBS Studio
# 1. Set recording area to terminal window
# 2. Start recording
# 3. Run: ./video-demo.sh
# 4. Stop when complete
```

**Windows:**
```bash
# Using OBS Studio or Xbox Game Bar (Win+G)
# 1. Start recording
# 2. Run: ./video-demo.sh in WSL/terminal
# 3. Stop recording
```

### Option 2: Terminal Recording with asciinema

```bash
# Install asciinema
sudo apt-get install asciinema  # Linux
brew install asciinema          # macOS

# Record the demo
asciinema rec usdc-wallet-demo.cast

# Run demo script
./video-demo.sh

# Stop recording (Ctrl+D or type 'exit')

# Replay locally
asciinema play usdc-wallet-demo.cast

# Upload to asciinema.org
asciinema upload usdc-wallet-demo.cast
```

### Option 3: Manual Recording (Phone)

If no screen recorder available:
1. Clean terminal, maximize window
2. Start phone video recording
3. Run `./video-demo.sh`
4. Film the terminal screen
5. Trim and upload video

## Demo Features

The `video-demo.sh` script includes:

- ✅ Professional title screen
- ✅ 8 sections covering all features
- ✅ Typing effects for engagement
- ✅ Color-coded output
- ✅ Pause points (press ENTER or auto-continue after 3s)
- ✅ Real code demonstrations
- ✅ Use case walkthroughs
- ✅ ~3-4 minute runtime

## Recording Tips

### Before Recording

1. **Clean terminal:** Clear scrollback, resize to readable size
2. **Font size:** Increase terminal font (16-20pt recommended)
3. **Color scheme:** Use high-contrast theme (dark background + bright text)
4. **Distractions:** Close other windows, silence notifications
5. **Test run:** Run `./video-demo.sh` once to see timing

### During Recording

1. **Fullscreen terminal:** Maximize for best visibility
2. **Let it run:** Script auto-advances or waits for ENTER
3. **Don't interrupt:** Let each section complete
4. **Optional narration:** Can speak over recording if desired

### After Recording

1. **Trim:** Remove any setup/cleanup at start/end
2. **Export:** MP4 or WebM format (best compatibility)
3. **File size:** Aim for <50MB (compress if needed)
4. **Upload:** YouTube, Loom, or embed in submission

## Alternative: Create GIF

For a quick animated preview:

```bash
# Using termtosvg (terminal to SVG)
pip install termtosvg
termtosvg record demo.svg -c ./video-demo.sh

# Or convert asciinema to GIF
npm install -g asciicast2gif
asciicast2gif -s 2 usdc-wallet-demo.cast demo.gif
```

## What to Include in Submission

**Minimum:**
- ✅ Link to video (YouTube, Loom, etc.)
- ✅ Or embed video file directly

**Better:**
- ✅ Video link + GIF preview
- ✅ Timestamps for key sections
- ✅ Written summary below video

**Best:**
- ✅ Professional video (2-4 min)
- ✅ Short GIF teaser (30 sec)
- ✅ Code walkthrough section
- ✅ Live demo with real transactions

## Demo Sections Breakdown

| Section | Duration | Content |
|---------|----------|---------|
| 1. Intro | 30s | What is USDC Agent Wallet? |
| 2. Project | 30s | File structure + dependencies |
| 3. Multi-chain | 30s | 8 chains supported |
| 4. API | 30s | 5 core functions |
| 5. CLI | 30s | Command-line interface |
| 6. Use Cases | 60s | 4 real-world scenarios |
| 7. Safety | 30s | Security features |
| 8. Quality | 30s | Production-ready code |
| 9. Future | 30s | Roadmap |
| 10. Summary | 30s | Wrap-up + links |

**Total:** ~5-6 minutes (can skip pauses for 3 min version)

## Quick Recording Command

```bash
# One-liner to record and save
./video-demo.sh | tee demo-output.txt
```

This saves the output to `demo-output.txt` while displaying it.

## Upload Destinations

**Video Hosting:**
- YouTube (unlisted link)
- Loom (free, easy screen recording)
- Vimeo
- Google Drive (public link)
- GitHub Releases

**GIF Hosting:**
- Imgur
- GIPHY
- GitHub (in README.md)

## Submission Format

Add to your Moltbook post:

```markdown
## 🎥 Video Demo

Watch the full walkthrough: [YouTube Link]

![Demo Preview](link-to-gif)

### What's Shown:
- Multi-chain USDC operations across 8 chains
- Complete agent API (balance, send, history, simulate)
- CLI interface demonstrations
- Real use cases (marketplace, bounties, treasury)
- Safety features and validation
```

## Need Help?

If you have issues:
1. Run `./video-demo.sh` manually first (check it works)
2. Try the simplest method: phone recording of screen
3. Or just screenshot key sections and create slides

---

**Goal:** Show judges the skill actually works and is polished!

**Time needed:** 15-20 minutes total (5 min recording + 10 min upload/edit)

**Impact:** 🚀🚀🚀 (massive credibility boost)
