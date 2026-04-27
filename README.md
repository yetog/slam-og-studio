# SLAM OG Studio

> Professional Web-Based Digital Audio Workstation
> A SLAM OG LLC Product

A next-generation web DAW built for professional music production with a focus on workflow, UI/UX, and eventually AI-assisted features.

---

## Vision

SLAM OG Studio is a **DAW-first** project. The core functionality must work flawlessly before any AI features are added.

**Phase 1 (MVP)**: Professional Web DAW
- Multi-track audio/MIDI recording and editing
- Built-in instruments (synth, sampler, drum machine)
- Professional effects chain (EQ, compression, reverb, delay)
- Piano roll, mixer, and arrangement views
- Project save/load and audio export

**Phase 2 (Enhancement)**: AI Integration
- Eleven Labs for music generation assistance
- Intelligent mixing suggestions
- Project management AI

---

## Branding

SLAM OG Studio follows the [SLAM OG LLC Brand Guidelines](docs/BRAND.md).

### Color Palette

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#050505` | Page background |
| Surface | `#151515` | Cards, panels |
| Primary (Gold) | `#C9A24A` | CTAs, accents |
| App Accent (Cyan) | `#5FD2D6` | App-specific highlights |
| Foreground | `#F8F6F0` | Text |
| Border | `#262626` | Dividers |

### Typography

- **Display**: Cinzel (serif) for headings
- **Body**: Inter (sans) for UI and text

### App Theme

Uses the `.theme-app` sub-theme with HUD-style elements inspired by Final Fantasy VII Rebirth. Cyan accent complements gold primary.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Audio Engine** | Web Audio API + AudioWorklets |
| **DSP** | Custom TypeScript DSP library |
| **Styling** | Tailwind CSS + SLAM OG theme |
| **AI** | Eleven Labs (Phase 2) |

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
└── UI Components
    ├── Arrangement View
    ├── Piano Roll
    ├── Mixer
    └── Transport Controls
```

---

## Development Phases

| Phase | Focus | Status |
|-------|-------|--------|
| 1 | Foundation & Branding | In Progress |
| 2 | Audio Engine (Core DAW) | Planned |
| 3 | Instruments & Effects | Planned |
| 4 | UI/UX (Piano Roll, Mixer) | Planned |
| 5 | Testing & Deploy | Planned |
| 6 | AI Integration (Post-MVP) | Future |

See [docs/SLAM_OG_STUDIO_DEVELOPMENT.md](docs/SLAM_OG_STUDIO_DEVELOPMENT.md) for detailed plan.

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
├── docs/
│   ├── BRAND.md                      # SLAM OG LLC brand guidelines
│   ├── AI_DAW_PLAN.md                # Architecture analysis
│   └── SLAM_OG_STUDIO_DEVELOPMENT.md # Step-by-step dev guide
├── research/                          # Reference materials
├── src/                               # Source code (coming soon)
│   ├── core/                          # Audio engine
│   ├── dsp/                           # DSP utilities
│   ├── instruments/                   # Synths, samplers
│   ├── effects/                       # Audio effects
│   └── ui/                            # React components
├── public/                            # Static assets
└── README.md
```

---

## Roadmap

### MVP (DAW Functionality)
- [ ] Fork WebDAW and apply SLAM OG branding
- [ ] Migrate to Vite
- [ ] Implement core audio engine
- [ ] Port instruments from openDAW
- [ ] Port effects from openDAW
- [ ] Build piano roll editor
- [ ] Build mixer panel
- [ ] Audio export (WAV/MP3)
- [ ] Project save/load
- [ ] Production deploy

### Post-MVP (AI Features)
- [ ] Eleven Labs music generation
- [ ] Mix analysis and suggestions
- [ ] Project management assistant

---

## License

MIT License

---

## Acknowledgments

- [WebDAW](https://github.com/ai-music/webdaw) by Hans-Martin Will
- [openDAW](https://github.com/andremichelle/openDAW) by Andre Michelle
- [SLAM OG LLC](https://slamogllc.com) brand system

---

*Infrastructure. Intelligence. Impact.*
