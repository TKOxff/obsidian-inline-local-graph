# PLAN: 그래프 표시 위치 선택 (노트 상단/하단)

## 1. 현황 및 원인 분석

측정 환경은 Obsidian 1.14.4(macOS)다. `test-vault` 사본을 scratchpad에 두고 별도 `--user-data-dir` 인스턴스에서 DevTools 프로토콜로 DOM과 레이아웃을 측정했다. 사용자의 Obsidian과 원본 `test-vault`는 건드리지 않았다.

### 1.1 편집 모드 DOM 구조

```
.cm-scroller (padding: var(--file-margins))
└─ .cm-sizer            display:flex; flex-direction:column; min-height:100%
   ├─ .inline-title
   ├─ .metadata-container     (속성)
   ├─ .cm-contentContainer    flex: 1 1 auto  ← 남는 높이만큼 늘어남
   │   └─ .cm-content          style="padding-bottom: <스크롤러 높이의 절반>px"  ← scroll past end
   ├─ .embedded-backlinks
   └─ .inline-graph-container  ← 현재 appendChild 위치
```

- Obsidian은 모드를 보여줄 때마다 `sizerEl.prepend(metadata)`, `sizerEl.prepend(inlineTitle)`, `sizerEl.appendChild(backlinks)`를 다시 실행한다.

### 1.2 편집 모드 공백의 원인 (SPEC 1장 과제)

`Welcome.md`(4줄) 측정 결과:

| 배치 | 본문 마지막 줄 하단 | 그래프 상단 | 간격 |
| --- | --- | --- | --- |
| 현재 하단 (창 높이 722px) | 274 | 667 | **393px** |
| 현재 하단 (창 높이 965px) | 277 | 792 | **515px** |
| 하단 + `.cm-content` padding-bottom 0 | 277 | 479 | 202px |
| 하단 + padding 0 + `.cm-contentContainer` flex-grow 0 | 277 | 309 | **32px (= 2em)** |
| 상단 (`.cm-sizer` 첫 자식) | — | 그래프 하단 674, 제목 674 | 0 |

- 공백은 두 가지가 합쳐진 것이다. 하나는 CodeMirror의 **scroll past end 여백**(`.cm-content`의 inline `padding-bottom`, 창 높이의 절반)이고, 다른 하나는 `.cm-contentContainer`의 **flex-grow**(짧은 노트에서 창 높이를 채움)다.
- 둘 다 본문 *아래*에 생긴다. 그래서 그래프가 본문 아래에 있으면 본문과 그래프 사이 공백이 되고, 그래프가 위에 있으면 본문 끝의 일반적인 빈 편집 영역이 된다.

### 1.3 읽기 모드 DOM 구조와 가상 렌더링

```
.markdown-preview-view (스크롤러)
└─ .markdown-preview-sizer
   ├─ .markdown-preview-pusher   (화면 밖 섹션 높이만큼 늘어나는 자리 표시자)
   ├─ .mod-header (inline-title + 속성)   ← 이것도 섹션 하나
   ├─ 섹션들 … (화면 근처만 DOM에 존재)
   └─ .mod-footer
```

300섹션짜리 `Long.md`를 스크롤하며 측정한 결과:

| 그래프 위치 | 결과 |
| --- | --- |
| `.mod-header` 다음 형제 | 스크롤하면 렌더러가 섹션을 다시 붙이면서 그래프가 렌더링된 섹션 끝(문서 중간)으로 밀려남 ✗ |
| `.mod-header` 내부 | 헤더가 화면 밖으로 나가 DOM에서 빠지면 플러그인이 그래프를 못 찾고 새로 만듦 → 중복 ✗ |
| `.markdown-preview-sizer` 앞 (스크롤러 직속) | 0~40000px 9개 지점에서 렌더링 범위가 항상 화면을 덮음. 위쪽 여유가 약 1000px에서 약 480px로 줄었지만 빈 화면 없음 ✓ |

- 부수 발견: **현재 하단 배치도** 긴 노트 읽기 모드에서 그래프가 문서 끝이 아니라 "현재 렌더링된 섹션 끝"에 붙는다 (스크롤 0일 때 41178px 문서의 1965px 지점). 이번 범위 밖이다 (SPEC 비범위).

## 2. 설계 및 작업 계획

### 2.1 설정

- `InlineGraphSettings.graphPosition: 'top' | 'bottom'`, 기본값 `'bottom'`. 기존 `data.json`은 `Object.assign` 병합으로 `bottom`이 된다.
- 설정 탭 `Graph` 섹션 맨 위에 드롭다운을 추가하고 i18n 키 `graphPositionName`, `graphPositionDesc`, `positionTop`, `positionBottom`을 넣는다.

### 2.2 삽입 위치 (`showInlineGraphInEditor`)

| 모드 | 상단 | 하단 (기존 유지) |
| --- | --- | --- |
| 읽기 | `.markdown-preview-view`에서 `.markdown-preview-sizer` **바로 앞** | `.markdown-preview-sizer` 끝에 append |
| 편집 | `.cm-sizer` **첫 자식** (제목 위) | `.cm-sizer` 끝에 append |

- 상단은 두 모드 모두 **노트 제목 위**다. 읽기 모드에서 헤더 아래에 둘 수 없으므로(1.3) 편집 모드도 같은 위치로 맞춘다.
- 기존 컨테이너는 그 모드의 범위(읽기: `.markdown-preview-view`, 편집: `.cm-sizer`)에서 찾는다. 위치가 설정과 다르면 옮기고, 없을 때만 만든다. 그래서 설정을 바꾸면 컨테이너가 이동하고 중복이 생기지 않는다.
- 상단 배치에서는 호출될 때마다 위치를 확인해서, Obsidian이 `inlineTitle`을 다시 prepend해 순서가 바뀌면 그래프를 맨 앞으로 되돌린다. 위치가 맞으면 DOM을 건드리지 않아 observer 루프가 생기지 않는다. 기존 코드도 observer를 끊은 상태에서 호출한다.
- 하단 배치는 기존과 같이 "없을 때만 append"한다. 상단에서 하단으로 바뀐 경우에만 옮긴다. 1.3의 기존 문제를 건드리지 않기 위해서다.
- 위치는 컨테이너 클래스 `is-top` / `is-bottom`으로 표시하고 CSS가 이 클래스를 쓴다.

### 2.3 CSS (`styles.css`)

- `.inline-graph-container.is-top`: `margin-top: 0; margin-bottom: 2em;` (제목·본문과의 간격)
- 읽기 모드 상단은 sizer 밖이라 readable line width가 적용되지 않는다. `.markdown-preview-view.is-readable-line-width > .inline-graph-container`에 `max-width: var(--file-line-width)`와 좌우 auto 마진을 준다.
- 편집 모드 하단 공백 제거 (1.2):
  ```css
  .cm-sizer:has(> .inline-graph-container.is-bottom) > .cm-contentContainer { flex-grow: 0; }
  .cm-sizer:has(> .inline-graph-container.is-bottom) > .cm-contentContainer > .cm-content { padding-bottom: 0 !important; }
  ```
  - `!important`는 CodeMirror가 inline style로 넣는 padding을 덮기 위해 필요하다.
  - 선택자를 직속 자식으로 한정해서 표 위젯 등 중첩 에디터의 `.cm-content`에는 적용되지 않게 한다.
  - 그래프가 없을 때(토글로 숨김)는 `:has`가 맞지 않으므로 Obsidian 기본 동작으로 돌아간다.

### 2.4 문서

- README 3종의 Settings 표에 "Graph position" 행 추가, Features에 한 줄 추가.
- `CHANGELOG.md`에 `## Unreleased` 항목 추가 (버전은 릴리즈 시 결정).

## 3. 착수 전 확정 사항

| | 항목 | 채택안 | 근거 | 결정 |
| --- | --- | --- | --- | --- |
| **A** | 상단의 정확한 위치 | 노트 제목 위 (두 모드 공통) | 읽기 모드 헤더 주변은 가상화로 위치 보장 불가 (1.3) | 채택 (변경 원하면 알려주세요) |
| **B** | 공백 과제의 대상 | 편집 모드 **하단** 배치의 공백 제거. 상단 배치는 측정상 공백 없음 | 측정 (1.2) | 채택 |
| **C** | scroll past end 여백 | 그래프가 하단에 있을 때만 제거 | 그래프가 마지막 요소라 여백의 역할이 없음 | 채택 |
| **D** | 읽기 모드 하단 기존 문제 | 이번엔 고치지 않음 | SPEC 비범위, 별도 이슈 후보 | 채택 |
| **E** | 릴리즈 | 이번 태스크는 CHANGELOG Unreleased까지. 버전·태그·PR은 사용자 확인 후 | 사용자 지시 "결과물만 확인" | 채택 |

## 4. 검증 방침

- **빌드 제약:** 이 환경에는 `node`가 없다. Obsidian 내장 Electron도 Node 모드가 막혀 있다. 그래서 `npm run build`(`tsc` 타입 검사 포함)와 `npm run lint`를 실행할 수 없다. 번들은 프로젝트에 설치된 esbuild 네이티브 바이너리(`node_modules/@esbuild/darwin-arm64/bin/esbuild`)로 같은 옵션을 써서 만든다. 타입 검사와 린트는 사용자 환경에서 확인을 요청한다.
- **동작 검증 (에이전트):** 격리 인스턴스에 새 번들을 넣고 아래를 측정한다.
  - 편집 하단: 본문과 그래프 간격이 약 32px인지
  - 편집 상단: 그래프가 제목 위, 공백 없음
  - 읽기 상단: 그래프가 sizer 앞, 긴 노트 스크롤 시 화면 덮임
  - 설정 토글: 컨테이너가 이동하고 개수가 1인지
  - 모드 전환·노트 전환 후 컨테이너 수
- **동작 검증 (사용자):** `test-vault`에서 상단/하단, 읽기/편집 모드 확인.

## 5. 롤백 계획

- 머지 전: 브랜치를 버린다.
- 머지 후: 머지 커밋을 `git revert -m 1`. 설정 키가 남아 있어도 이전 버전은 무시하므로 데이터 문제는 없다.
