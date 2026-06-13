<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/🇺🇸-English-blue?style=for-the-badge" alt="English"></a>
  <a href="README.ko.md"><img src="https://img.shields.io/badge/🇰🇷-한국어-red?style=for-the-badge" alt="한국어"></a>
</p>

# Code-Driven Development (CDD)

> **코드가 유일한 진실 공급원(Single Source of Truth)입니다.** 스펙, 문서, 아키텍처는 모두 코드에서 파생되며, 그 반대가 아닙니다.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT"></a>
  <a href="https://www.npmjs.com/package/code-drive"><img src="https://img.shields.io/npm/v/code-drive" alt="npm version"></a>
  <a href="https://github.com/eastjin616/code-drive/actions"><img src="https://img.shields.io/github/actions/workflow/status/eastjin616/code-drive/ci.yml?branch=main" alt="CI"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/node/v/code-drive" alt="Node version"></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome"></a>
</p>

---

## 이 프로젝트가 중요한 이유

AI 기반 소프트웨어 개발 시대에 코드는 그 어느 때보다 빠르게 생성되고 있습니다. 하지만 기존 방법론들은 여전히 코드를 스펙이나 문서의 **부산물**로 취급합니다. 이는 근본적인 문제를 만듭니다: **스펙과 구현이 점점 달라집니다.**

**Code-Driven Development (CDD)** 는 이 관계를 역전시켜 문제를 해결합니다:

| 전통적 방식 (Spec-Driven) | 코드 중심 (CDD) |
|--------------------------|-------------------|
| 스펙 → 코드 | **코드 → 스펙** |
| 문서를 따로 작성하고 방치됨 | 문서는 코드에서 *추출*됨 |
| 아키텍처는 ADR에 존재 | 아키텍처는 코드 구조에 인코딩됨 |
| 여러 개의 진실 공급원 | **단일 진실 공급원: 코드** |

CDD는 **개발자 도구**이자 **방법론**입니다:
1. **문서 부동화(Drift) 제거** — 실제 소스 코드의 AST 분석으로 문서 생성
2. **AI 네이티브 워크플로 지원** — 깔끔한 코드 구조가 AI 에이전트(Codex, Claude Code, Copilot)의 인터페이스
3. **유지보수 부담 감소** — 코드 한 번 수정 = 문서와 스펙 자동 업데이트
4. **조기 문제 발견** — `cdd review`로 네이밍, 문서 커버리지, 순환 의존성, 모듈 크기 감사

### 대상 사용자

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
| 👁️ **Watch 모드** | `cdd docgen --watch` | 파일 변경 시 문서 자동 재생성 |
| 🖥️ **TUI 모드** | `cdd --tui` | 인터랙티브 TUI 메뉴로 모든 명령어 실행 |

---

## 설치

```bash
# 글로벌 설치 (권장)
npm install -g code-drive

# 설치 없이 직접 실행
npx code-drive <command>
```

**요구사항:** Node.js 18+

---

## 빠른 시작

```bash
# 1단계: 프로젝트에 CDD 초기화
cdd init

# 2단계: 코드베이스에서 문서 생성
cdd docgen

# 3단계: 아키텍처 스펙 추출
cdd spec

# 4단계: CDD 원칙에 따라 코드 감사
cdd review
```

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

프로젝트에 CDD 설정을 초기화합니다. `.cdd/config.json` 파일을 생성합니다.

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

### `cdd spec [directory]`

코드 구조를 분석하여 아키텍처 스펙을 생성합니다:
- 프로젝트 개요 및 모듈 맵
- 전체 소스 파일 간 Import 의존성 그래프
- API 표면 메트릭 (export된 함수, 클래스, 인터페이스)

| 옵션 | 설명 |
|--------|-------------|
| `-o, --output <path>` | 출력 파일 (기본값: `./ARCHITECTURE.md`) |

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

### `cdd --tui`

인터랙티브 TUI 모드로 실행합니다. init/docgen/spec/review를 메뉴에서 선택하여 실행할 수 있습니다.

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
├── ARCHITECTURE.md         # 생성된 아키텍처 스펙 (cdd spec)
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
| `npm test` | vitest 테스트 실행 (19 tests) |
| `npm run dev` | tsx로 직접 실행 |
| `npm run lint` | ESLint 검사 |
| `npm run format` | Prettier 자동 포맷 |

---

## 기여하기

기여를 환영합니다! [CONTRIBUTING.md](CONTRIBUTING.md) 가이드라인을 참고해주세요.

## 라이선스

MIT — 자세한 내용은 [LICENSE](LICENSE)를 확인하세요.
