# RESEARCH: Obsidian Inline Local Graph Plugin

> 위치: `.ai-workflow/docs/RESEARCH.md` — **읽기 위한 설명 문서**입니다.
> 구조가 **크게 바뀔 때만** 갱신하는 상주 문서입니다.
> 최종 갱신: 2026-09-26 (v0.9.11 기준. planfirst 도입 시 `.ai-agent/RESEARCH.md`(v0.9.6 기준)에서 옮겨 갱신)

## 1. 프로젝트 개요

Obsidian 노트 하단에 현재 노트와 연결된 노트들의 네트워크 그래프를 인라인으로 표시하는 플러그인.

- **ID**: `inline-local-graph`
- **버전**: 0.9.11 (`package.json`·`manifest.json`·`versions.json` 일치)
- **최소 Obsidian 버전**: 0.16.0
- **저자**: TKOxff
- **git 저장소**: https://github.com/TKOxff/obsidian-inline-local-graph
- **로컬 테스트 볼트**: 저장소 안의 `test-vault/` (`npm run setup-vault`로 빌드 결과물을 링크)

---

## 2. 프로젝트 구조

```
obsidian-inline-graph/
├── src/
│   ├── main.ts                  # 플러그인 진입점, 설정 타입·기본값 (176줄)
│   ├── InlineGraphView.ts       # 그래프 렌더링 + 컨트롤 바 (307줄)
│   ├── InlineGraphSettingTab.ts # 설정 UI (212줄)
│   └── i18n.ts                  # UI 문자열 번역 en/ko/ja (162줄)
├── docs/                        # CONTRIBUTING.md, RELEASE.md, TODO.md
├── res/                         # README용 예시 이미지
├── test-vault/                  # 플러그인 테스트용 볼트 (노트만 커밋)
├── scripts/setup-test-vault.mjs # test-vault에 빌드 결과물 심볼릭 링크 생성
├── .ai-workflow/                # planfirst 작업 문서
├── manifest.json, versions.json # 플러그인 메타데이터, 버전 ↔ minAppVersion
├── package.json                 # 의존성 및 스크립트
├── esbuild.config.mjs           # 빌드 설정
├── version-bump.mjs             # npm version 시 manifest·versions 동기화
├── styles.css                   # 플러그인 스타일 (130줄)
├── README.md / README.ko.md / README.ja.md
└── CHANGELOG.md
```

`main.js`는 빌드 산출물이며 gitignore 대상 (현재 약 660KB, 프로덕션 minify 시).

---

## 3. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| 언어 | TypeScript | 4.7.4 |
| 프레임워크 | Obsidian Plugin API | latest |
| 그래프 라이브러리 | vis-network (`vis-network/standalone`) | ^10.0.1 |
| 번들러 | esbuild | 0.17.3 |
| 린팅 | ESLint + @typescript-eslint | 5.29.0 |
| 타겟 | ES2018 (esbuild) / ES6 (tsconfig) | |
| 모듈 | CommonJS (Obsidian 요구사항) | |
| 테스트 | 없음 — `test-vault/`에서 수동 확인 | |

---

## 4. 아키텍처

### 클래스 구조

```
InlineGraphPlugin (extends Plugin)              — main.ts
├── onload() / onunload()          → 라이프사이클 관리
├── loadSettings() / saveSettings()→ 설정 영속화 (DEFAULT_SETTINGS 병합)
├── MutationObserver               → DOM 변경 감지 (300ms 디바운스)
├── Ribbon Icon ('waypoints')      → 그래프 표시 토글
├── Command 'toggle-inline-graph'  → 마크다운 뷰에서만 활성
├── updateGraphs()                 → 설정 변경 시 모든 마크다운 leaf 재렌더
└── InlineGraphView                → 렌더링 위임

InlineGraphView                                 — InlineGraphView.ts
├── renderTo(container)            → 진입점: 래퍼·컨트롤·그래프 div 구성
├── createZoomControls()           → Outgoing/Incoming 토글 + 줌 -/+ 버튼
├── renderGraph()                  → 노드·엣지 생성, vis-network 렌더링
├── truncateLabel() / hasWideChar()→ 언어별 라벨 길이 제한
└── getSettings()/saveSettings()   → 생성자로 받은 콜백 (느슨한 결합)

InlineGraphSettingTab (extends PluginSettingTab) — InlineGraphSettingTab.ts
└── display()                      → "Graph" / "Node Style" 두 섹션

i18n                                            — i18n.ts
└── t(key)                         → 현재 로케일 문자열, 없으면 en 폴백
```

### 데이터 흐름

```
노트 전환/DOM 변경 → MutationObserver → (300ms 디바운스) showInlineGraphInEditor()
→ InlineGraphView.renderTo() → renderGraph() → vis-network 렌더링
→ 노드 클릭 → openLinkText() → 새 노트 로드 → 반복
```

### 렌더링 모드

- **Preview 모드**: `.markdown-preview-sizer` 컨테이너에 `.inline-graph-container` 추가
- **Source/Live 모드**: `.cm-sizer` 컨테이너 (CodeMirror) 에 추가
- 이미 컨테이너가 있으면 재사용 (중복 방지)

---

## 5. 핵심 기능

### 5.1 인라인 그래프 렌더링
- 노트 하단에 연결된 노트의 네트워크 그래프 표시
- 고정 높이 500px, 상단 마진 2em (`styles.css`)
- 물리 엔진 `repulsion` 솔버, 안정화 200 이터레이션

### 5.2 노드 구성
- **현재 노트**: 항상 표시, 최대 노드 수 계산에서 제외
- **아웃고잉 링크**: `metadataCache.resolvedLinks` 기반, 엣지 opacity 1.0
- **백링크**: 내부 API `getBacklinksForFile` 기반, 라벨 opacity 0.6, 엣지 opacity 0.3
- **최대 노드 수** (`maxNodes`): 아웃고잉을 먼저 채우고 남는 자리에 백링크. 표시되지 않는 노드로 향하는 엣지는 제거
- **라벨 줄임**: 한중일·전각 문자가 포함되면 `maxLabelLengthCJK`, 아니면 `maxLabelLength` 기준으로 자르고 `...` 추가

### 5.3 인터랙션
- **노드 클릭**: `openLinkText()`로 해당 노트 열기
- **컨트롤 바** (마우스 호버 시 표시): Outgoing 토글, Incoming 토글, 줌 -/+ (0.2x ~ 5.0x, 1.2배 단위)
- 줌 변경 시 `nodeDistance`·`springLength`를 배율에 반비례로 조정하고 `zoomScale` 저장
- 마우스 휠 줌은 비활성 (`interaction.zoomView: false`) — 노트 스크롤 방해 방지

### 5.4 다국어 (i18n)
- 설정창·컨트롤 바 문자열을 en/ko/ja로 제공
- Obsidian UI 언어를 `localStorage`의 `language` 키에서 읽음. 미지원 언어는 en

---

## 6. 데이터 / 설정 스키마

`InlineGraphSettings` (`main.ts`), 저장 위치는 플러그인 폴더의 `data.json`.

| 설정 | 타입 | 기본값 | 설정 UI |
|------|------|--------|---------|
| `showArrows` | boolean | `true` | 토글 |
| `showGraphBorder` | boolean | `false` | 토글 |
| `showLinks` | boolean | `true` | 토글 + 컨트롤 바 |
| `showBacklinks` | boolean | `true` | 토글 + 컨트롤 바 |
| `skipImageLinks` | boolean | `true` | 토글 (png/jpg/jpeg/gif/svg 제외) |
| `zoomScale` | number | `1.0` | 슬라이더 0.5–5.0 + 컨트롤 바 |
| `maxNodes` | number | `30` | 숫자 입력 1–200 (범위 밖은 보정) |
| `nodeShape` | string | `'box'` | 드롭다운: ellipse / box / circle / dot / text |
| `nodeBgColor` | hex | `'#888888'` | 색상 선택기 |
| `nodeFontSize` | number | `14` | 슬라이더 8–28 |
| `truncateLabels` | boolean | `true` | 토글 |
| `maxLabelLength` | number | `20` | 슬라이더 5–50 (알파벳 언어) |
| `maxLabelLengthCJK` | number | `10` | 슬라이더 3–30 (한중일) |

기존 사용자의 `data.json`에 없는 키는 `DEFAULT_SETTINGS`로 채워진다. 렌더링 쪽에서도 `??`로 기본값을 한 번 더 둔다.

---

## 7. 빌드 / 릴리즈

```bash
npm run dev          # watch 모드, 인라인 소스맵
npm run build        # tsc 타입 체크 + 프로덕션 번들(minify)
npm version <ver>    # manifest.json + versions.json 자동 업데이트
npm run setup-vault  # test-vault에 main.js·manifest.json·styles.css 링크
```

### esbuild 설정
- Entry: `src/main.ts`
- Bundle: true (vis-network 포함)
- External: obsidian, electron, codemirror, lezer, Node.js 빌트인
- Format: CommonJS

### GitHub Release 제약사항
- **릴리즈 태그에 `v` 접두사를 붙이지 않는다.** (예: `0.9.8` ✅ / `v0.9.8` ❌) 예외로 `v0.9.8` 태그가 하나 남아 있다.
- Obsidian은 일관된 태그 형식으로만 에셋을 탐색함
- 릴리즈 에셋: `manifest.json`, `main.js`, `styles.css` 필수 첨부

---

## 8. 주요 구현 디테일

### MutationObserver 패턴 (`main.ts` `onload`)
- DOM 변경을 300ms 디바운스로 감지
- 업데이트 중 observer 연결을 끊어 무한 루프 방지

### 설정 콜백 패턴 (`InlineGraphView` 생성자)
- `getSettings()` / `saveSettings()` 콜백을 생성자로 전달해 플러그인과 느슨하게 결합

### 백링크 조회 (`InlineGraphView.renderGraph`)
```typescript
getBacklinksForFile(file: TFile): { data: Map<string, unknown> }
```
- Obsidian 내부 API (타입 미공개) — 타입 단언으로 접근

### 노드 거리 계산
```typescript
getNodeDistance(scale) = Math.max(1, 80 / scale)
```
- 줌 레벨에 반비례하여 반발력 조정 (`getSpringLength`도 같은 식)

### 노드 ID / 경로 매핑
- 노드 ID는 파일 basename (디렉토리·`.md` 제거). `idToPath`로 클릭 시 경로 복원
- 다른 폴더의 같은 이름 파일은 한 노드로 합쳐진다

---

## 9. 코드 품질 분석

### 강점
- **타입 안전성**: strict null check, noImplicitAny 적용
- **관심사 분리**: Plugin, View, SettingTab, i18n 4개 모듈
- **디바운싱**: MutationObserver 성능 최적화
- **느슨한 결합**: 설정을 콜백으로 전달

### 개선 가능 영역
- 고정 500px 높이 → 반응형 미지원
- 설정 변경 시 전체 그래프 재렌더링 (점진적 업데이트 없음)
- 노드 ID가 basename이라 동명 파일 충돌 가능
- vis-network 전체 번들로 `main.js`가 큼
- 자동화된 테스트 없음

---

## 10. 의존성

- **프로덕션**: vis-network — 유일한 런타임 의존성, `main.js`에 번들됨
- **Obsidian 제공 (external)**: obsidian, electron, codemirror, lezer
- **개발**: TypeScript, ESLint, esbuild, @types/node, tslib, builtin-modules

---

## 11. 릴리즈 이력 요약

자세한 내용은 `CHANGELOG.md`, 태스크별 기록은 `.ai-workflow/archived/`.

- **0.9.11**: 기본 노드 모양 Box로 변경, README 재작성·한국어/일본어 번역, Donate 버튼
- **0.9.10**: 최대 표시 노드 수 설정 (#13)
- **0.9.9**: 영어·한중일 라벨 길이 분리, 설정창 다국어 지원
- **0.9.8**: 컨트롤 바에 Outgoing/Incoming 토글
- **0.9.7**: 노드 스타일 설정 — 모양·글자 크기·라벨 줄임 (#6)
- **0.9.6**: 타입 수정, 설정 콜백 리팩토링
- **0.9.3**: 스타일을 CSS로 분리, 새로고침 버튼 추가, 줌 설정
- **0.9.2**: 백링크 투명도, 이미지 링크 스킵, 스크롤 줌 비활성화
