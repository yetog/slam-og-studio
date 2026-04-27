# SLAM OG Studio

> AI-Powered Web-Based Digital Audio Workstation

A next-generation DAW that combines professional audio production capabilities with AI-assisted workflow for music creation, mixing, and mastering.

---

## Vision

SLAM OG Studio aims to democratize music production by providing:

- **Professional DAW Features** - Multi-track recording, MIDI editing, mixing, mastering
- **AI Music Generation** - Powered by Eleven Labs for creative assistance
- **Intelligent Mixing Suggestions** - Real-time analysis with actionable feedback
- **Project Management** - AI-guided workflow to keep productions on track

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Audio Engine** | Web Audio API + AudioWorklets |
| **AI Backend** | Eleven Labs (generation) + Claude API (analysis) |
| **DSP** | Custom TypeScript DSP library |
| **Styling** | Tailwind CSS + Custom theme |

---

## Architecture

```
SLAM OG Studio
├── Core Audio Engine (WebDAW foundation)
├── DSP Library (ported from openDAW)
├── Instruments
│   ├── Synthesizer (subtractive)
│   ├── Sampler
│   └── Drum Machine
├── Effects
│   ├── Delay, Reverb, EQ
│   ├── Compressor, Limiter
│   └── Stereo Tools
├── AI Integration
│   ├── Audio Analyzer (FFT, RMS, LUFS)
│   ├── Mix Suggestions (rule-based + AI)
│   ├── Eleven Labs (music generation)
│   └── Project Assistant (Claude)
└── UI Components
    ├── Arrangement View
    ├── Piano Roll
    ├── Mixer
    └── AI Assistant Panel
```

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation (setup, Vite migration) | Planning |
| 2 | Audio Engine (core, DSP, worklets) | Planning |
| 3 | Instruments & Effects | Planning |
| 4 | UI Polish (piano roll, mixer) | Planning |
| 5 | AI Integration | Planning |
| 6 | Deploy & Polish | Planning |

See [docs/SLAM_OG_STUDIO_DEVELOPMENT.md](docs/SLAM_OG_STUDIO_DEVELOPMENT.md) for detailed step-by-step plan.

---

## AI Features

### Music Generation (Eleven Labs)
- Generate melodies, chord progressions, drum patterns
- Style-based generation (genre presets)
- Variation creation from existing material

### Mixing Suggestions
- Real-time frequency analysis
- Stereo field monitoring
- Loudness metering (LUFS)
- One-click auto-fix for common issues

### Project Assistant
- Genre-based production checklists
- Progress tracking
- Next-step recommendations
- Creative guidance via chat

---

## Research

This project builds on analysis of two open-source DAWs:

| Project | What We Use |
|---------|-------------|
| [WebDAW](https://github.com/ai-music/webdaw) | Clean UI architecture, React components, audio engine |
| [openDAW](https://github.com/andremichelle/openDAW) | DSP library, synthesizers, effects, advanced features |

See [docs/AI_DAW_PLAN.md](docs/AI_DAW_PLAN.md) for full analysis.

---

## Getting Started

```bash
# Clone the repo
git clone git@github.com:yetog/slam-og-studio.git
cd slam-og-studio

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Project Structure

```
slam-og-studio/
├── docs/                    # Documentation & plans
│   ├── AI_DAW_PLAN.md       # Architecture & feature plan
│   └── SLAM_OG_STUDIO_DEVELOPMENT.md  # Step-by-step dev guide
├── research/                # Reference materials
├── src/                     # Source code (coming soon)
│   ├── core/                # Audio engine
│   ├── dsp/                 # DSP utilities
│   ├── instruments/         # Synths, samplers
│   ├── effects/             # Audio effects
│   ├── ai/                  # AI integration
│   └── ui/                  # React components
├── public/                  # Static assets
└── README.md
```

---

## Roadmap

- [ ] Phase 1: Foundation setup
- [ ] Phase 2: Core audio engine
- [ ] Phase 3: Basic instruments & effects
- [ ] Phase 4: Piano roll & mixer UI
- [ ] Phase 5: Eleven Labs integration
- [ ] Phase 6: Production deployment

---

## Contributing

This is a personal project by Isayah Young-Burke. Contributions welcome once the foundation is complete.

---

## License

MIT License - See LICENSE file for details.

---

## Acknowledgments

- [WebDAW](https://github.com/ai-music/webdaw) by Hans-Martin Will
- [openDAW](https://github.com/andremichelle/openDAW) by Andre Michelle
- [Eleven Labs](https://elevenlabs.io/) for AI audio generation
- [Anthropic](https://anthropic.com/) for Claude AI

---

*Built with passion for music and AI.*
