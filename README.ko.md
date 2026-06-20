<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.ko.md"><img src="https://img.shields.io/badge/🇰🇷-한국어-red?style=for-the-badge" alt="한국어"></a>
</p>

# Code-Driven Development (CDD)

> **코드가 유일한 진실 공급원(Single Source of Truth)입니다.** 스펙, 문서, 아키텍처는 모두 코드에서 파생되며, 그 반대가 아닙니다.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/@eastjin616/code-drive"><img src="https://img.shields.io/npm/v/@eastjin616/code-drive" alt="npm version"></a>
  <a href="https://github.com/eastjin616/code-drive/actions"><img src="https://img.shields.io/github/actions/workflow/status/eastjin616/code-drive/ci.yml?branch=main" alt="CI"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/code-drive" alt="Node version"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## 왜 만들었나

AI는 코드를 빠르게 만들 수 있습니다. 하지만 프로젝트 맥락은 여전히 소스 파일, 생성 문서, 체인지로그, AI 지침 파일 여기저기에 흩어져 있습니다. Codex나 Claude Code 같은 에이전트 런타임은 `AGENTS.md`, `CODEX.md`, `CLAUDE.md`, `CHANGELOG.md`를 자동으로 읽을 수 있지만, ChatGPT/Claude/Gemini 웹에 직접 프롬프트를 붙여넣는 사용자는 그렇지 않습니다. 무엇을 붙여넣어야 하는지, 어디까지 설명해야 하는지, AI가 없는 API를 지어내지 않게 하려면 어떻게 해야 하는지 매번 직접 판단해야 합니다.

**Code-Driven Development (CDD)** 는 코드베이스 자체를 문서, 아키텍처, 체인지로그 맥락, 복붙용 프롬프트의 출처로 삼기 위해 만들었습니다. 사람이 별도 스펙을 계속 관리하는 대신, 실제 구현에서 작업 맥락을 파생합니다.

CDD는 이 관계를 역전시켜 문제를 해결합니다:

| 전통적 방식 (Spec-Driven) | 코드 중심 (CDD) |
|--------------------------|-------------------|
| 스펙 → 코드 | **코드 → 스펙** |
| 문서를 따로 작성하고 방치됨 | 문서는 코드에서 *추출*됨 |
| 아키텍처는 ADR에 존재 | 아키텍처는 코드 구조에 인코딩됨 |
| 여러 개의 진실 공급원 | **단일 진실 공급원: 코드** |

CDD는 **개발자 도구**이자 **방법론**입니다:
1. **문서 부동화(Drift) 제거** — 실제 소스 코드의 AST 분석으로 문서 생성
2. **프롬프트만 쓰는 AI 사용자 지원** — `cdd prompt`가 ChatGPT, Claude, Gemini에 붙여넣을 프로젝트 브리프를 생성
3. **AI 네이티브 워크플로 지원** — `cdd ai install`이 생성 문서를 AI 시작 문서에 연결
4. **유지보수 부담 감소** — 코드 한 번 수정 = 문서, 스펙, 프롬프트 컨텍스트 갱신
5. **조기 문제 발견** — `cdd review`로 네이밍, 문서 커버리지, 순환 의존성, 모듈 크기 감사

### 대상 사용자

- **프롬프트만 쓰는 AI 사용자** — ChatGPT, Claude, Gemini 웹에 프로젝트 맥락을 붙여넣는 분
- **개인 개발자** — 개인 프로젝트의 자동 문서화가 필요한 분
- **소규모 OSS 팀** — 부담 없는 아키텍처 문서화가 필요한 팀
- **AI 기반 개발팀** — 코드 품질이 AI 에이전트 효율에 직결되는 팀

---

## 기능

| 기능 | 명령어 | 설명 |
|---------|---------|-------------|
| ⚡ **초기화** | `cdd init` | 모든 프로젝트에 CDD 설정 초기화 |
| 📖 **문서 생성** | `cdd docgen` | TypeScript AST로 코드에서 API 문서/README/어노테이션 추출 |
| 🏗️ **아키텍처 스펙** | `cdd spec` | 전체 의존성 그래프를 포함한 아키텍처 스펙 생성 |
| 🔍 **리뷰** | `cdd review` | CDD 원칙에 따른 코드베이스 감사 |
| 🩺 **Doctor** | `cdd doctor` | Node, Git, CDD 설정, 소스 분석, 생성 문서 상태 진단 |
| ✅ **Verify** | `cdd verify` | 설정, 문서 최신성, AI 라우팅, 리뷰 에러 기준 릴리즈 준비 확인 |
| ✍️ **프롬프트 팩** | `cdd prompt` | ChatGPT/Claude/Gemini에 붙여넣을 AI 프롬프트 브리프 출력 |
| 📋 **컨텍스트** | `cdd context` | AI 프롬프트용 프로젝트 구조/함수/의존성 출력 |
| 🤖 **AI 라우팅** | `cdd ai install` | AI 시작 문서에 CDD 문서 참조 규칙 설치 |
| 🎨 **디자인** | `cdd design` | CSS/TS/Tailwind에서 디자인 토큰 추출 (색상/폰트/간격) |
| 📝 **체인지로그** | `cdd changelog` | Git 히스토리 + 코드 분석으로 CHANGELOG.md 자동 생성 |
| 👁️ **Watch 모드** | `cdd docgen --watch` | 파일 변경 시 문서 자동 재생성 |
| 📦 **Sync** | `cdd sync` | docgen + spec + design + changelog 한 번에 실행 |
| 🗑️ **제거** | `cdd uninstall` | 프로젝트에서 모든 CDD 아티팩트 제거 |

---

## TUI — 인터랙티브 모드 (기본)

`cdd`를 인수 없이 실행하면 프로젝트 대시보드가 먼저 보이는 TUI가 실행됩니다:

```
$ cdd

    ██████╗██████╗ ██████╗ 
   ██╔════╝██╔══██╗██╔══██╗
   ██║     ██║  ██║██║  ██║
   ██║     ██║  ██║██║  ██║
   ╚██████╗██████╔╝██████╔╝
    ╚═════╝╚═════╝ ╚═════╝ 
   Code-Driven Development

? 실행할 명령어를 선택하세요 (Use arrow keys)
Project dashboard
  Project      code-drive
  Status       ready
  Checks       11 pass
  Recommended  verify — 릴리즈 준비 상태 확인

? 실행할 내용을 선택하세요 (Use arrow keys)
❯ 추천 액션 실행        — project status에 맞는 다음 명령
  verify               — 릴리즈 준비 상태 확인
  명령어 직접 실행       — sync, design, changelog, ai install 등 선택
  init                 — CDD 설정 초기화
  ai install           — AI 시작 문서 라우팅 설치
  update               — cdd 자체 업데이트
  uninstall            — CDD 아티팩트 제거
```

`추천 액션 실행`은 현재 상태에 맞춰 다음 명령을 자동으로 고릅니다:

- 생성 문서가 없거나 오래됐으면 `sync`
- AI 시작 문서 라우팅이 없으면 `ai install`
- 준비 상태가 정상이면 `verify`
- 설정 조치가 필요하면 `doctor`

`명령어 직접 실행` 선택 시 그룹별 다중 선택 메뉴로 이동합니다:

```
? 실행할 명령어를 선택하세요 (Space로 선택, Enter로 실행)
  권장 흐름
  └ ▪ 권장 전체 흐름 — doctor + sync + review + verify + context
  진단
  ├ ▪ doctor
  └ ▪ verify
  생성
  ├ ▪ sync
  ├ ▪ docgen
  ├ ▪ spec
  ├ ▪ design
  └ ▪ changelog
  AI
  ├ ▪ ai install
  ├ ▪ prompt
  └ ▪ context
  관리
  ├ ▪ review
  └ ▪ uninstall
```

- 대시보드는 `cdd verify`와 같은 readiness check를 기반으로 합니다.
- 권장 전체 흐름은 `sync`를 사용해서 생성 문서와 AI 라우팅을 같이 맞춥니다.
- 다중 선택 후 Enter를 누르면 선택된 명령을 안정된 순서로 실행합니다.
- 생성 명령어(docgen/spec/design/changelog) 완료 후 파일 열기 확인

`--cli` 플래그를 전달하면 TUI 없이 CLI 모드로 직접 실행합니다.

---

## 설치

```bash
# 글로벌 설치 (권장)
npm install -g @eastjin616/code-drive

# 설치 없이 직접 실행
npx @eastjin616/code-drive <command>
```

**요구사항:** Node.js 18+

---

## 빠른 시작

### 프롬프트만 쓰는 AI 워크플로

AI 도구가 `AGENTS.md`, `CODEX.md`, `CLAUDE.md`, `ARCHITECTURE.md`, `CHANGELOG.md` 같은 repo 파일을 자동으로 읽지 못할 때 사용합니다.

```bash
# 코드에서 프로젝트 문서 갱신
cdd sync

# ChatGPT, Claude, Gemini 등에 붙여넣을 프롬프트 팩 출력
cdd prompt

# 특정 파일 질문이면 파일 중심 프롬프트 생성
cdd prompt --file src/cli.ts
```

출력된 내용을 AI 채팅창에 붙여넣고, 모델이 더 요구하는 파일을 이어서 첨부하거나 붙여넣으면 됩니다.

### 개발자 워크플로

```bash
# 1단계: 프로젝트에 CDD 초기화
cdd init

# 2단계: 문서 + 스펙 + 디자인 + 체인지로그 한 번에 생성
cdd sync

# 3단계: CDD 원칙에 따라 코드 감사
cdd review

# 4단계: 사람 또는 AI에게 넘기기 전 릴리즈 준비 상태 확인
cdd verify
```

`cdd init`은 `.cdd/config.json`만 만드는 데서 끝나지 않습니다. `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md` 같은 AI 시작 문서가 있으면 CDD 문서 라우팅 블록을 자동으로 넣고, 없으면 `AGENTS.md`를 만듭니다. 그래서 Codex, Claude Code, OpenCode 같은 도구가 시작할 때 `DESIGN.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `docs/README.md`를 어떤 작업에서 참고해야 하는지 알 수 있습니다.

### 실행 예시

```bash
# `cdd docgen` 실행:
$ cdd docgen

Scanning codebase...
   13 source files, 28 functions, 1 classes, 11 interfaces
✓ 10 documentation files generated
   Output: /Users/you/project/docs/
```

생성된 파일 구조:
```
docs/
├── README.md              # API 테이블이 포함된 프로젝트 개요
└── api/
    ├── src--cli.md         # 소스 파일별 API 레퍼런스
    ├── src--commands--docgen.md
    ├── src--core--analyzer.md
    ├── src--core--generator.md
    └── ...
```

```bash
# `cdd spec` 실행:
$ cdd spec
Analyzing code architecture...
   28 functions, 1 classes, 11 interfaces
   41 import relationships
✓ Architecture spec generated
   Output: ARCHITECTURE.md
```

```bash
# `cdd review` 실행:
$ cdd review
Running CDD review...

CDD Review — my-project v1.0.0
   28 functions, 1 classes, 11 interfaces

Warnings (3):
  ⚠ TODO: add multiplication function [src/index.ts:15]
  ⚠ HACK: fetchData uses mock endpoint [src/utils.ts:23]

Info (17):
  ℹ Exported function "fetchData" has no JSDoc/TSDoc comment. [src/utils.ts:24]
  ...
```

---

## CDD 방법론

### 핵심 원칙

1. **코드가 진실 공급원** — 코드베이스가 표준 표현입니다. 그 외 모든 것은 파생된 뷰입니다.
2. **파생 아티팩트** — 문서, 스펙, 아키텍처는 코드에서 생성되며, 독립적으로 작성되지 않습니다.
3. **기본적으로 자기 문서화** — 타입 시그니처, JSDoc/TSDoc, 인라인 어노테이션이 주요 문서화 수단입니다.
4. **최소 설정** — 코드로 표현할 수 있으면 코드로. 설정은 시스템 경계에서만 존재합니다.
5. **AI 네이티브** — 깔끔한 코드 구조가 AI 에이전트의 인터페이스입니다. CDD는 AI가 코드를 읽고, 쓰고, 리뷰하는 워크플로를 위해 설계되었습니다.

### AI 기반 개발을 위한 설계

CDD는 AI 에이전트가 일급 참여자인 워크플로에 최적화되어 있습니다:

- **AI가 코드를 읽음** → 타입 시그니처가 있는 깔끔한 구조가 Codex에게 가장 좋은 프롬프트 컨텍스트입니다.
- **AI가 코드를 작성함** → CDD 규칙을 따르면 생성된 코드가 스스로 문서화됩니다.
- **스펙 부동화 없음** → 코드 자체가 스펙이므로, 구식이 될 것이 없습니다.
- **AI가 생성 문서를 발견함** → `cdd init`과 `cdd sync`가 AI 시작 문서에 작업별 CDD 문서 라우팅을 유지합니다.

### AI 컨텍스트 라우팅

대부분의 AI 코딩 도구는 프로젝트 시작 시 루트의 지침 파일을 먼저 읽습니다. 하지만 일반 사용자가 `DESIGN.md`, `ARCHITECTURE.md`, `CHANGELOG.md`를 직접 챙겨 AI에게 읽히기는 어렵습니다. CDD는 이 연결을 자동화합니다.

`cdd init` 실행 시 CDD는 루트의 AI 시작 문서를 찾습니다:

- `AGENTS.md`
- `CLAUDE.md`
- `CODEX.md`
- `OPENCODE.md`

하나 이상 있으면 각 파일에 CDD managed block을 삽입/갱신합니다. 하나도 없으면 `AGENTS.md`를 생성합니다. `cdd sync`는 문서 재생성 후 같은 블록을 최신화하고, `cdd ai install`은 수동 복구/재설치용으로 사용할 수 있습니다.

이 managed block은 AI에게 작업 유형별로 어떤 생성 문서를 참고해야 하는지 알려줍니다:

- 프로젝트/API 개요는 `docs/README.md`
- 모듈 경계, 엔트리포인트, import, 의존성 변경 전에는 `ARCHITECTURE.md`
- UI, UX, 스타일, 레이아웃, 색상, 간격, 타이포그래피, 디자인 토큰 작업 전에는 `DESIGN.md`
- 릴리즈 노트, 버전, 마이그레이션, 최근 변경 맥락은 `CHANGELOG.md`
- 생성 문서와 코드가 충돌하면 코드를 우선하고 `cdd sync` 실행

CDD는 `<!-- cdd:ai-context:start -->`와 `<!-- cdd:ai-context:end -->` 사이 블록만 관리하며, 기존 지침은 보존합니다.

### 다른 방법론과의 비교

| 방법론 | 진실 공급원 | 주요 대상 |
|-------------|----------------|-----------------|
| **TDD** | 테스트 | 정확성 검증 |
| **BDD** | 행동 스펙 | 이해관계자 커뮤니케이션 |
| **Spec-Driven** | 문서 | AI 프롬프트 엔지니어링 |
| **CDD (이것)** | **코드 그 자체** | **장기 유지보수성** |

---

## 명령어 레퍼런스

### `cdd init [directory]`

프로젝트에 CDD 설정을 초기화합니다. `.cdd/config.json` 파일을 생성하고, 기존 AI 시작 문서(`AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`)에 CDD 컨텍스트 라우팅을 설치합니다. AI 시작 문서가 없으면 `AGENTS.md`를 생성합니다.

| 옵션 | 설명 |
|--------|-------------|
| `-f, --force` | 기존 설정 덮어쓰기 |

### `cdd docgen [directory]`

TypeScript 컴파일러 API로 소스 파일을 스캔하여 다음을 생성합니다:
- **README.md** — 퍼블릭 API 테이블(함수, 클래스, 인터페이스)이 포함된 프로젝트 개요
- **api/*.md** — 시그니처와 JSDoc이 포함된 파일별 API 레퍼런스
- **코드 어노테이션 인덱스** — 모든 TODO, FIXME, HACK, NOTE 마커 테이블

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 출력 디렉토리 (기본값: `./docs`) |
| `-w, --watch` | 소스 파일 감시 및 변경 시 자동 재생성 |
| `--include-tests` | 테스트/fixture 파일까지 문서 생성에 포함 |

### `cdd spec [directory]`

코드 구조를 분석하여 아키텍처 스펙을 생성합니다:
- 프로젝트 개요 및 모듈 맵
- 전체 소스 파일 간 Import 의존성 그래프
- API 표면 메트릭 (export된 함수, 클래스, 인터페이스)

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 출력 파일 (기본값: `./ARCHITECTURE.md`) |
| `--include-tests` | 테스트/fixture 파일까지 아키텍처 분석에 포함 |

### `cdd review [directory]`

CDD 원칙에 따라 코드베이스를 감사합니다. 검사 항목:

| 규칙 | 심각도 | 감지 내용 |
|------|----------|----------------|
| **naming** | 경고 | `_` 접두사가 있는 export 심볼 (내부 구현 누수) |
| **documentation** | 정보 | JSDoc/TSDoc이 누락된 export 심볼 |
| **code-health** | 경고 | TODO, FIXME, HACK 어노테이션 |
| **dependency** | 에러 | 파일 간 순환 의존성 |
| **module-size** | 경고 | 500줄 초과 파일 (분할 권장) |

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 결과를 파일로 저장 |
| `--include-tests` | 테스트/fixture 파일까지 리뷰에 포함 |
| `--max-findings <count>` | 심각도 그룹별 최대 출력 개수 |

### `cdd context [directory]`

AI 프롬프트에 최적화된 프로젝트 컨텍스트 출력 — 모듈 구조, export 심볼, import 관계, 의존성 그래프.

| 옵션 | 설명 |
|--------|-------------|
| `-f, --file <path>` | 특정 파일만 컨텍스트 출력 |
| `--include-tests` | 테스트/fixture 파일까지 프로젝트 컨텍스트에 포함 |

### `cdd prompt [directory]`

ChatGPT, Claude, Gemini 같은 채팅형 AI에 붙여넣을 프롬프트 팩을 출력합니다. AI가 repo 파일을 자동으로 읽지 못하는 환경에서 사용합니다.

프롬프트 팩에는 다음이 포함됩니다:

- 프로젝트 이름, 버전, 언어, 엔트리포인트, 의존성, 소스 파일 수
- `README.md`, `ARCHITECTURE.md`, `CHANGELOG.md`, `docs/README.md`처럼 붙여넣거나 첨부하면 좋은 파일
- `.cdd/config.json`, docs, architecture, design, changelog 산출물의 생성 상태
- AI가 코드베이스 밖 내용을 지어내지 않도록 하는 제약
- 프로젝트 설명, 리스크 리뷰, 구현 계획을 요청하는 시작 질문

| 옵션 | 설명 |
|--------|-------------|
| `-f, --file <path>` | 특정 파일 중심 프롬프트 생성 |
| `--include-tests` | 테스트/fixture 파일까지 프롬프트 분석에 포함 |

### `cdd ai install [directory]`

AI 시작 문서에 CDD managed context-routing block을 설치하거나 갱신합니다. `cdd init` 이후 AI 시작 문서를 새로 만들었거나, CDD managed block을 재설치하고 싶을 때 사용합니다.

기존 `AGENTS.md`, `CLAUDE.md`, `CODEX.md`, `OPENCODE.md`를 갱신합니다. 하나도 없으면 `AGENTS.md`를 생성합니다.

### `cdd doctor [directory]`

로컬 실행 환경과 CDD 설정을 빠르게 진단합니다:

- Node.js 버전
- Git 설치 여부와 Git 저장소 여부
- `.cdd/config.json`
- 소스 분석 범위
- 생성 아티팩트 최신성

| 옵션 | 설명 |
|--------|-------------|
| `--include-tests` | 테스트/fixture 파일까지 프로젝트 분석에 포함 |

### `cdd verify [directory]`

프로젝트를 릴리즈하거나 사람/AI에게 넘기기 전에 준비 상태를 한 번에 확인합니다. 환경, CDD 설정, 생성 문서 최신성, AI 컨텍스트 라우팅, 리뷰 에러를 합쳐 하나의 상태로 보여줍니다:

- `ready` — 설정, 문서, AI 라우팅, 리뷰 에러가 모두 정상
- `needs-sync` — 생성 문서가 없거나 소스보다 오래됨
- `needs-attention` — 설정, AI 라우팅, 소스 분석, 리뷰 에러에 조치 필요

| 옵션 | 설명 |
|--------|-------------|
| `--include-tests` | 테스트/fixture 파일까지 프로젝트 분석에 포함 |
| `--json` | 기계가 읽기 쉬운 JSON 출력 |

### `cdd design [directory]`

CSS/TS/Tailwind에서 디자인 토큰을 추출하여 `DESIGN.md` 생성:
- **CSS**: `--color-*`, `--font-*`, `--space-*` 커스텀 프로퍼티
- **CSS rule**: `background-color`, `padding`, `border-radius`, `box-shadow` 같은 실제 사용 스타일
- **TypeScript**: 명명된 `const` 색상/간격 객체
- **Tailwind**: `tailwind.config.*` theme 확장

대상 디렉터리가 실제 프로젝트가 아니라 상위 workspace/root로 보이면 루트에 `DESIGN.md`를 만들지 않고 건너뜁니다.

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 출력 파일 (기본값: `./DESIGN.md`) |

### `cdd uninstall [directory]`

프로젝트에서 CDD 생성 아티팩트 제거 — `.cdd/`, `docs/`, `ARCHITECTURE.md` 등. AI 시작 문서에 CDD managed block이 있으면, 해당 블록도 제거할지 yes/no로 묻습니다. 제거하더라도 각 AI 시작 문서의 기존 지침은 보존하고 CDD block만 삭제합니다.

| 옵션 | 설명 |
|--------|-------------|
| `--remove-ai-context` | 묻지 않고 AI 시작 문서에서 CDD managed block 제거 |
| `--keep-ai-context` | 묻지 않고 AI 시작 문서의 CDD managed block 유지 |

### `cdd sync [directory]`

모든 생성기를 순차 실행: `docgen` → `spec` → `design` → `changelog`. 문서 재생성 후 AI 시작 문서의 CDD 컨텍스트 라우팅 블록도 최신화합니다. 대상 디렉터리가 프로젝트가 아닌 workspace/root로 보이면 `design`과 `changelog`는 루트 파일 생성을 건너뜁니다.

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 생성된 아티팩트 출력 디렉토리 |
| `--include-tests` | 테스트/fixture 파일까지 생성 분석에 포함 |

### `cdd changelog [directory]`

Conventional Commit 기반 Git 히스토리 파싱 → CHANGELOG.md 생성/갱신. 태그로 버전 범위 자동 결정. 대상 디렉터리가 프로젝트 레벨이 아니면 루트에 `CHANGELOG.md`를 만들지 않고 건너뜁니다.

| 옵션 | 설명 |
|--------|-------------|
| `-f, --from <ref>` | 시작 커밋 (기본값: 마지막 태그 또는 첫 커밋) |
| `-t, --to <ref>` | 종료 커밋 (기본값: HEAD) |
| `-o, --output <path>` | 출력 파일 (기본값: `./CHANGELOG.md`) |
| `--dry-run` | 파일 쓰기 없이 미리보기 |

---

## 프로젝트 구조

CDD가 적용된 프로젝트는 규약 중심(convention-over-configuration) 레이아웃을 따릅니다:

```
my-project/
├── src/                    # 소스 코드 — 유일한 진실 공급원
│   ├── index.ts
│   └── modules/
├── docs/                   # 생성된 문서 (cdd docgen)
├── .cdd/                   # CDD 설정
│   └── config.json
├── AGENTS.md               # CDD 컨텍스트 라우팅이 들어간 AI 시작 문서
├── ARCHITECTURE.md         # 생성된 아키텍처 스펙 (cdd spec)
├── DESIGN.md               # 생성된 디자인 토큰 가이드 (cdd design)
├── CHANGELOG.md            # 생성된 체인지로그 (cdd changelog)
└── README.md               # cdd docgen으로 보강됨
```

---

## 개발

```bash
git clone https://github.com/eastjin616/code-drive.git
cd code-drive
npm install
npm run build     # TypeScript 컴파일
npm test          # 테스트 실행
npm run lint      # ESLint
npm run format    # Prettier
```

### 스크립트

| 명령어 | 설명 |
|--------|-------------|
| `npm run build` | TypeScript 컴파일 → `dist/` |
| `npm test` | vitest 테스트 실행 (62 tests) |
| `npm run dev` | tsx로 직접 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 자동 포맷 |

---

## 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md) 가이드라인을 참고해주세요.

## 라이선스

MIT — 자세한 내용은 [LICENSE](LICENSE)를 확인하세요.
