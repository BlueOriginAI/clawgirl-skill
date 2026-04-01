# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.23] - 2026-04-01

### Changed
- Keep package name as `clawgirl-selfie`
- SaaS backend uses simplified prompt templates (Clawra-style) for better instruction following
- User instructions now occupy >50% of total prompt length
- Smart mode detection: Mirror mode for outfits, Direct mode for scenes
- Added English keyword support for mode detection (wearing, cafe, beach, etc.)

### Fixed
- Fixed duplicate "自拍" word in Direct mode prompts
- Fixed English inputs not triggering simplified mode

## [0.0.22] - 2026-04-01

### Changed
- Renamed package from `clawgirl` to `clawra-selfie` for better alignment with Clawra-style prompt approach
- Updated CLI binary name to `clawra-selfie`

## [0.0.21] - 2026-04-01

### Changed
- SaaS backend now uses simplified prompt templates (Clawra-style) for better instruction following
- User instructions now occupy >50% of total prompt length
- Smart mode detection: Mirror mode for outfits, Direct mode for scenes
- Added English keyword support for mode detection (wearing, cafe, beach, etc.)

### Fixed
- Fixed duplicate "自拍" word in Direct mode prompts
- Fixed English inputs not triggering simplified mode

## [0.0.20] - 2026-03-31

### Changed
- Prefer ClawHub-based installation guidance in public docs and storefront copy
- Remove public-facing `npx` installation guidance from README and SKILL metadata
- Update public wording to use ClawGirl API / integration language instead of hosted-service marketing phrasing

### Fixed
- Treat `/api/v1/chat` text-only responses as normal skill output instead of errors
- Document the `TEXT_RESPONSE_BASE64` output contract for OpenClaw integration

## [0.0.11] - 2025-03-24

### Changed
- Reorganize project structure: move `SKILL.md` and `scripts/` into `skill/` directory
- Improve error handling in CLI with user-friendly messages
- Add debug logging support via `CLAWGIRL_DEBUG` env variable

### Fixed
- Resolve duplicate file structure (root vs skill/ directory)

## [0.0.10] - 2024-03-14

### Changed
- Align skill trigger rules with visual generation flow

## [0.0.9] - 2024-03-13

### Added
- Website management hint in skill response

## [0.0.8] - 2024-03-12

### Added
- Auto-load API Key from openclaw.json config file

## [0.0.7] - 2024-03-11

### Changed
- Replace clawra.png with clawgirl.jpeg

## [0.0.6] - 2024-03-10

### Added
- Inform users that persona/outfit is managed on clawgirl.date

### Changed
- Simplify skill, remove persona/outfit content

## [0.0.5] - 2024-03-09

### Added
- Auto-update logic when skill already installed

## [0.0.4] - 2024-03-08

### Added
- Uninstall command for clawgirl skill

### Changed
- Improve skill format and dynamic path handling

## [0.0.3] - 2024-03-07

### Fixed
- Use 'export type' for TypeScript isolatedModules compatibility
- Change copywriting to more intimate tone

### Changed
- Rename clawgirl-skill to clawgirl across CLI and documentation

## [0.0.2] - 2024-03-06

### Added
- New user registration flow with device fingerprint and signature verification
- Update README with installation steps for new users

### Fixed
- API Key format changed to `cg_live_` prefix
- Conversational copywriting + cross-platform directory copy

## [0.0.1] - 2024-03-05

### Added
- Initial release
- Clawgirl skill for OpenClaw integration
- Integration with clawgirl.date API
- Selfie generation capability
- CLI installer

[0.0.11]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/BlueOriginAI/clawgirl-skill/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/BlueOriginAI/clawgirl-skill/releases/tag/v0.0.1
