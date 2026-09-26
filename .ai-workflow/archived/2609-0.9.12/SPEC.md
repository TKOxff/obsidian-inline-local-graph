# SPEC: 0.9.12 — 커뮤니티 디렉토리 자동 검사 대응

| 항목 | 내용 |
| --- | --- |
| **태스크 ID** | 0.9.12 / Issue #16 |
| **유형** | Bugfix / Chore |
| **상태** | Done |
| **작성일** | 2026-09-26 |
| **관련 이슈** | #16 |

## 1. 목표 (Why)

- Obsidian 커뮤니티 디렉토리의 자동 검사에서 최신 릴리즈 0.9.11이 **Caution(33건)** 판정을 받았다(#16).
- **2026-10-30** 이후에도 최신 릴리즈가 검사를 통과하지 못하면 디렉토리 목록에서 빠지고 앱에서 설치할 수 없게 된다.
- 검사 항목을 고친 0.9.12를 릴리즈해 목록에 계속 남는다.

## 2. 작업 범위 (Scope)

검사 결과(공개 페이지 `community.obsidian.md/plugins/inline-local-graph`, 2026-09-26 확인)의 항목 중 아래를 고친다.

| # | 등급 | 항목 | 위치 |
| --- | --- | --- | --- |
| S1 | high | manifest author 필드에 이메일 | `manifest.json:7` (`package.json` author도 맞춤) |
| S2 | medium | `document.createElement` 대신 Obsidian DOM 헬퍼 사용 | `InlineGraphView.ts` 11곳, `main.ts:113` |
| S3 | medium | 스타일 직접 대입 금지 | `InlineGraphSettingTab.ts:105-106`, `InlineGraphView.ts:88` |
| S4 | medium | 설정 제목을 HTML 태그 대신 `setHeading()`으로 | `InlineGraphSettingTab.ts:24, 125` |
| S5 | medium | `minAppVersion`보다 새로운 API 사용 | `InlineGraphSettingTab.ts:148-150` → `minAppVersion`을 필요한 최소값 **1.8.7**로 올림 (`getLanguage()` 요구) |
| S6 | medium | `builtin-modules` 패키지 교체 | `package.json`, `esbuild.config.mjs` |
| S7 | medium | 비정상 공백 문자 | `InlineGraphView.ts:13` |
| S8 | medium | `localStorage` 대신 `getLanguage()` | `i18n.ts:153` |
| S10 | info | lockfile 커밋 (빌드 재현 검증용) | `package-lock.json` |
| S11 | info | `vis-network` 버전 고정 | `package.json:32` |
| S12 | — | 같은 검사를 로컬에서 돌릴 수 있게 `eslint-plugin-obsidianmd` 린트 설정 추가 | `eslint.config.mjs`, `package.json` |

- 릴리즈 단계: `CHANGELOG.md` 0.9.12 항목, 버전 bump(`version_files` 3개), PR, 태그 `0.9.12`, GitHub 릴리즈, #16에 대응 결과 코멘트.

### 비범위 (Out of Scope)

- `getSettingDefinitions()` 선언형 설정 API 전환 — 권장 사항이고 작업이 크다. 다음 태스크로 넘긴다(사용자 결정).
- S9 `setDynamicTooltip` 제거 — 1.13 미만에서는 슬라이더 값 표시가 사라진다. info 등급이라 유지한다(사용자 결정, 코드 작업 중).
- GitHub artifact attestation — GitHub Actions 릴리즈 파이프라인이 필요하다. 별도 태스크.
- 기능 변경, UI 디자인 변경 — 화면과 동작은 0.9.11과 같아야 한다.
- 이슈 #17("Inline local graph on the top"), #9(README 갱신)
- 린트 설정 추가로 새로 드러나는 경고 중 검사 결과 33건에 없는 것 — 기록만 하고 고치지 않는다. 단, 빌드를 깨뜨리는 것은 예외로 묻는다.

## 3. 요구사항 / 수용 기준 (Acceptance Criteria)

- `npm run build`가 오류 없이 끝난다.
- `npm run lint`(eslint-plugin-obsidianmd `recommended`)에서 S1~S8에 해당하는 규칙 위반이 0건이다.
- `manifest.json`의 `author`에 `@`가 없다.
- `src/`에 `document.createElement`, `.style.` 대입, `createEl('h`, `localStorage`가 없다 (`grep`).
- `package.json`에 `builtin-modules`가 없고 `vis-network`가 정확한 버전으로 고정되어 있다.
- `package-lock.json`이 커밋되어 있고 `npm ci`가 성공한다.
- `test-vault`에서 플러그인을 켰을 때 그래프·컨트롤 바·설정 탭이 0.9.11과 같이 동작한다 (사용자 수동 확인).
- 릴리즈 후 공개 검사 페이지에서 S1~S8, S10, S11 항목이 사라진다 (검사 반영 시점은 Obsidian 쪽에 달려 있다).

## 4. 영향 범위 / 고려사항

- `minAppVersion` 상향: 그보다 오래된 Obsidian 사용자는 0.9.12로 업데이트할 수 없다. 기존 버전은 계속 쓸 수 있다.
- `getLanguage()`는 Obsidian 언어 코드를 돌려준다. `ko`, `ja` 판정 결과가 기존과 같아야 한다.
- S2, S3, S4는 DOM 생성 방식만 바꾸고 클래스명과 구조는 유지한다. `styles.css` 선택자가 그대로 맞아야 한다.
- 린트 도입(S12)은 devDependencies 추가와 ESLint 설정 형식 변경(`.eslintrc` → flat config)을 수반한다. 런타임 번들에는 영향이 없다.

## 5. 참고 자료

- 이슈 #16: https://github.com/TKOxff/obsidian-inline-local-graph/issues/16
- 검사 결과 공개 페이지: https://community.obsidian.md/plugins/inline-local-graph
- ESLint 규칙: https://github.com/obsidianmd/eslint-plugin
- `TROUBLE.md` — v0.9.8 태그 `v` 접두사 문제, v0.9.9 `npm version` 자동 커밋/태그 문제
