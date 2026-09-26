# PLAN: 0.9.12 — 커뮤니티 디렉토리 자동 검사 대응

## 1. 현황 및 원인 분석

### 1.1 기준선

- `npm ci` → `npm run build` 성공 (2026-09-26, Node 26.10.0). 수정 전 기준선은 정상이다.
- 린트는 레거시 `.eslintrc`(@typescript-eslint 5.29)만 있고 `npm run lint` 스크립트가 없다. 검사기와 같은 규칙을 로컬에서 돌릴 방법이 없다.

### 1.2 린트 도구 제약

- `eslint-plugin-obsidianmd` 0.4.2의 peer: `eslint >=9.19`, `typescript-eslint ^8.35`, `@eslint/js ^9.30`, `@eslint/json 0.14.0`, `obsidian 1.8.7`.
- `typescript-eslint` 8은 `typescript >=4.8.4`를 요구한다. 현재 `typescript 4.7.4` → **TypeScript 상향이 필요하다.**
- `obsidian`은 `package.json`에 `latest`로 되어 있고, lockfile에서는 1.8.7로 풀린다. peer와 일치한다.

### 1.3 항목별 원인 (SPEC S1~S11)

| # | 원인 | 결론 |
| --- | --- | --- |
| S1 | `manifest.json` `author`가 `"TKOxff <tkoxff@gmail.com>"` | 이름만 남김 |
| S2 | View·main에서 `document.createElement` 후 `appendChild` | Obsidian 전역 헬퍼 `createDiv`/`createEl`/`createSpan` 또는 부모의 `createDiv()`로 교체 |
| S3 | 줌 버튼 `style.marginLeft`, 숫자 입력 `style.width`/`textAlign` | `styles.css`에 클래스 추가 후 클래스 부여 |
| S4 | `containerEl.createEl('h6')` 2곳 | `new Setting(containerEl).setName(...).setHeading()` |
| S5 | `addColorPicker`가 `minAppVersion 0.16.0`보다 새로운 API | 린트 결과를 보고 최소 버전 결정 (3장 A) |
| S6 | `esbuild.config.mjs`가 `builtin-modules` 패키지 사용 | Node 내장 `module.builtinModules`로 교체 |
| S7 | `hasWideChar` 정규식 문자 클래스에 U+3000(전각 공백)이 문자 그대로 있음 | 범위를 `\uXXXX` 이스케이프로 표기 (의미 동일) |
| S8 | `window.localStorage.getItem('language')` | `obsidian`의 `getLanguage()` |
| S9 | 슬라이더 4곳 `setDynamicTooltip()` | 호출 제거 (값은 이제 항상 표시됨) |
| S10 | `package-lock.json` untracked | 커밋 |
| S11 | `vis-network: ^10.0.1` | lockfile에 풀린 버전으로 정확히 고정 |

## 2. 설계 및 작업 계획

### 2.1 린트 도구 도입 (S12) — 먼저 한다

- devDependencies: `eslint`, `typescript-eslint`, `@eslint/js`, `@eslint/json`, `eslint-plugin-obsidianmd` 추가. 구 `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser` 5.29 제거. `typescript` 상향.
- `eslint.config.mjs`(flat config)로 `obsidianmd.configs.recommended` 적용, 대상은 `src/`와 `manifest.json`·`package.json`. `.eslintrc`, `.eslintignore` 삭제.
- `package.json`에 `lint` 스크립트 추가.
- 도입 직후 린트를 돌려 **수정 전 결과**를 확보하고, 검사 결과 33건과 대조한다.

### 2.2 메타데이터·의존성 (S1, S6, S10, S11)

- `manifest.json`, `package.json`의 author 정리.
- `esbuild.config.mjs`: `builtin-modules` import를 `node:module`의 `builtinModules`로 교체, 패키지 제거.
- `vis-network`, `obsidian` 정확한 버전으로 고정.

### 2.3 소스 수정 (S2~S5, S7~S9)

- 파일별로 한 번에 고친다: `InlineGraphView.ts`(S2, S3, S7), `main.ts`(S2), `InlineGraphSettingTab.ts`(S3, S4, S9), `i18n.ts`(S8), `styles.css`(S3 클래스).
- 클래스명과 DOM 구조는 유지한다.

### 2.4 `minAppVersion` (S5)

- `no-unsupported-api`가 경고하지 않는 가장 낮은 버전으로 `manifest.json`, `versions.json`(0.9.12 항목)을 맞춘다. `versions.json`의 기존 항목은 건드리지 않는다.

## 3. 착수 전 확정 사항

| | 항목 | 채택안 | 근거 | 결정 |
| --- | --- | --- | --- | --- |
| **A** | `minAppVersion` 값 | 린트가 요구하는 최소값 | 구버전 사용자 최대 유지 | 사용자 결정 |
| **B** | TypeScript 버전 | 5.x 최신 정확 고정 | typescript-eslint 8 요구(`>=4.8.4 <6.1`). 5.x는 기존 코드와 호환 범위 | 채택 |
| **C** | 린트 설정 형식 | flat config로 교체, 레거시 삭제 | ESLint 9 필수. 두 형식 공존은 혼란 | 채택 |
| **D** | S2 교체 방식 | 부모에 바로 붙는 곳은 `parent.createDiv()`, 나중에 붙이는 곳은 전역 `createDiv()` 등 | 구조를 바꾸지 않고 규칙만 만족 | 채택 |
| **E** | 린트로 새로 드러난 경고 | 기록만 하고 고치지 않음 (SPEC 비범위) | 범위 통제 | 채택 |
| **F** | 버전 bump 방식 | `npm version` 대신 세 파일 수동 수정 | `TROUBLE.md` v0.9.9 — 자동 커밋·태그 방지 | 채택 |

## 4. 검증 방침

- 기계 검증: `npm ci`, `npm run build`, `npm run lint` 종료 코드와 출력, `grep`으로 금지 패턴 부재 확인.
- 동작 검증: `test-vault`에서 사용자가 수동 확인. 에이전트는 Obsidian을 실행할 수 없으므로 이 항목은 사용자 확인 전까지 미완료로 둔다.
- 최종 판정은 릴리즈 후 공개 검사 페이지. 반영 시점은 통제할 수 없으므로 태스크 완료 조건에서 제외하고 릴리즈 후 확인 항목으로 둔다.

## 5. 롤백 계획

- 머지 전: 브랜치를 버린다.
- 머지 후 릴리즈 전: 머지 커밋을 `git revert -m 1`.
- 릴리즈 후: `gh release delete 0.9.12`, 태그 삭제, 수정본으로 0.9.13 릴리즈. `minAppVersion` 상향으로 업데이트를 못 받은 사용자는 0.9.11을 계속 쓴다.
