# TODO: 0.9.12 — 커뮤니티 디렉토리 자동 검사 대응

## 0. 착수 관문

- [x] `PLAN.md` 3장의 확정 사항에 답이 모두 채워짐
- [x] **착수 지시 수령** — "SPEC 작성하고 PLAN TODO 까지 모두 작성하고 바로 코드작업 진행까지해" (연속 진행)
- [x] 작업 브랜치 생성 완료 — `feature/2609-v0.9.12`

## 1. 린트 도구 도입 (S12)

- [x] devDependencies 교체 (eslint 9, typescript-eslint 8, @eslint/js, @eslint/json, eslint-plugin-obsidianmd, typescript 5.x)
- [x] `eslint.config.mjs` 작성, `.eslintrc`·`.eslintignore` 삭제
- [x] `lint` 스크립트 추가
- [x] 수정 전 린트 결과 확보 및 검사 결과와 대조 — S2~S8 일치. 검사에 없던 `no-unsafe-*` 6건(`InlineGraphView.ts:260-263`, `main.ts:170`)은 기록만 (PLAN 3장 E)

## 2. 메타데이터·의존성

- [x] S1 author 이메일 제거 (`manifest.json`, `package.json`)
- [x] S6 `builtin-modules` → `node:module` `builtinModules`
- [x] S11 `vis-network`·`obsidian` 버전 고정
- [x] S10 `package-lock.json` 갱신·커밋

## 3. 소스 수정

- [x] S2 `document.createElement` 교체 (`InlineGraphView.ts`, `main.ts`)
- [x] S3 스타일 직접 대입 → CSS 클래스 (`InlineGraphView.ts`, `InlineGraphSettingTab.ts`, `styles.css`)
- [x] S4 설정 제목 `setHeading()`
- [x] S7 정규식 전각 공백 이스케이프
- [x] S8 `getLanguage()`
- [x] ~~S9 `setDynamicTooltip()` 제거~~ — 비범위로 이동 (SPEC 2장)
- [x] S5 `minAppVersion` 최소값 결정·반영 — 1.8.7

## 4. 검증

- [x] `npm ci` 성공
- [x] `npm run build` 성공
- [x] `npm run lint` — S1~S8 해당 규칙 위반 0건. 종료 코드는 1 (비범위 `no-unsafe-*` 6건, `prefer-setting-definitions` 1건 남음)
- [x] `grep` — `src/`에 `document.createElement`, `.style.` 대입, `createEl('h`, `localStorage` 없음
- [x] `grep` — `package.json`에 `builtin-modules` 없음, `vis-network` 범위 기호 없음, `manifest.json` author에 `@` 없음
- [x] `test-vault` 수동 확인 — 그래프 표시, Outgoing/Incoming 토글, 줌 버튼 간격, 노드 클릭 이동, 설정 탭 제목·숫자 입력칸 모양, ko/ja 표시 (사용자 확인 완료)

## 5. 마무리 (릴리즈 단계 — `/planfirst:task-release`)

- [x] `CHANGELOG.md` 0.9.12 작성 (영어)
- [x] 버전 bump — `package.json`, `manifest.json`, `versions.json` 수동 수정 (+ `package-lock.json`)
- [x] `NOTES.md`가 있으면 승격 — 없음, 건너뜀
- [x] 태스크 폴더 `archived/`로 이동
- [ ] PR 생성 (`Closes #16`은 넣지 않음 — 검사 반영 확인 후 종료) 및 병합
- [ ] 태그 `0.9.12` (v 없음) 및 GitHub 릴리즈 (main.js, manifest.json, styles.css)
- [ ] 공개 검사 페이지 재확인 후 #16에 결과 코멘트 및 종료
